const GITHUB_USERNAME = "GITHUB_USERNAME";
const GITHUB_TOKEN = "GITHUB_TOKEN";

// Helper function to make authenticated GitHub API requests
const githubRequest = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from GitHub API: ${error.message}`);
    return null;
  }
};

// Function to fetch total followers, following, and total repositories (including private)
const getUserStats = async () => {
  const userProfile = await githubRequest(
    `https://api.github.com/user`,
    GITHUB_TOKEN
  );

  if (!userProfile) return null;

  const totalFollowers = userProfile.followers;
  const totalFollowing = userProfile.following;

  // Total repositories (including private) are available in `public_repos` and `total_private_repos`
  const totalPublicRepos = userProfile.public_repos;
  const totalPrivateRepos = userProfile.total_private_repos;

  const totalRepositories = totalPublicRepos + totalPrivateRepos;

  return {
    totalFollowers,
    totalFollowing,
    totalRepositories,
  };
};

// Function to fetch the total stars
const getTotalStars = async () => {
  const repos = await githubRequest(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos`
  );
  if (!repos) return 0;
  const totalStars = repos.reduce(
    (acc, repo) => acc + repo.stargazers_count,
    0
  );
  return totalStars;
};

// Function to fetch total commits for the current year
const getTotalCommitsForCurrentYear = async () => {
  const currentYear = new Date().getFullYear();

  // Fetch all repositories (both public and private)
  const repos = await githubRequest(
    `https://api.github.com/user/repos?per_page=100`,
    GITHUB_TOKEN
  );
  if (!repos) return 0;

  const totalCommits = await Promise.all(
    repos.map(async (repo) => {
      let allCommits = [];
      let nextPageUrl = `${repo.url}/commits?since=${currentYear}-01-01T00:00:00Z&per_page=100`;

      // Loop through all pages of commits for the current year
      while (nextPageUrl) {
        const pageData = await githubRequest(nextPageUrl, GITHUB_TOKEN);
        allCommits = allCommits.concat(pageData); // Add page commits to total
        nextPageUrl = getNextPageUrl(pageData.links); // Extract next page link (if available)
      }

      return allCommits.length;
    })
  );

  return totalCommits.reduce((acc, commits) => acc + commits, 0);
};

// Function to fetch total commits for the last year
const getTotalCommitsForLastYear = async () => {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  // Fetch all repositories (both public and private)
  const repos = await githubRequest(
    `https://api.github.com/user/repos?per_page=100`,
    GITHUB_TOKEN
  );
  if (!repos) return 0;

  const totalCommits = await Promise.all(
    repos.map(async (repo) => {
      let allCommits = [];
      let nextPageUrl = `${repo.url}/commits?since=${lastYear}-01-01T00:00:00Z&until=${lastYear}-12-31T23:59:59Z&per_page=100`;

      // Loop through all pages of commits for the last year
      while (nextPageUrl) {
        const pageData = await githubRequest(nextPageUrl, GITHUB_TOKEN);
        allCommits = allCommits.concat(pageData); // Add page commits to total
        nextPageUrl = getNextPageUrl(pageData.links); // Extract next page link (if available)
      }

      return allCommits.length;
    })
  );

  return totalCommits.reduce((acc, commits) => acc + commits, 0);
};

const getTotalCommits = async () => {
  const repos = await githubRequest(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`
  );
  if (!repos) return 0;

  const totalCommits = await Promise.all(
    repos.map(async (repo) => {
      let allCommits = [];
      let nextPageUrl = repo.url + "/commits?per_page=100";

      // Loop through all pages of commits for the repo
      while (nextPageUrl) {
        const pageData = await githubRequest(nextPageUrl);
        allCommits = allCommits.concat(pageData); // Add page commits to total
        nextPageUrl = getNextPageUrl(pageData.links); // Extract next page link (if available)
      }

      return allCommits.length;
    })
  );

  return totalCommits.reduce((acc, commits) => acc + commits, 0);
};

// Helper function to extract next page URL from Link header (if present)
function getNextPageUrl(links) {
  if (!links) return null;
  const nextLink = links.find((link) => link.rel === "next");
  return nextLink ? nextLink.url : null;
}

// Function to fetch PRs and related data
const getPRStats = async () => {
  const pullRequests = await githubRequest(
    `https://api.github.com/search/issues?q=type:pr+author:${GITHUB_USERNAME}`
  );
  if (!pullRequests) return { totalPRs: 0, totalMergedPRs: 0 };

  const totalPRs = pullRequests.total_count;

  const mergedPRs = await githubRequest(
    `https://api.github.com/search/issues?q=type:pr+author:${GITHUB_USERNAME}+is:merged`
  );
  const totalMergedPRs = mergedPRs ? mergedPRs.total_count : 0;

  return { totalPRs, totalMergedPRs };
};

// Function to fetch the number of repositories contributed to in the last year
const getContributedRepos = async () => {
  const contributions = await githubRequest(
    `https://api.github.com/search/issues?q=type:pr+author:${GITHUB_USERNAME}+created:>2023-01-01`
  );
  return contributions ? contributions.total_count : 0;
};

function calculateRankLevel(
  totalCommits,
  totalPRs,
  totalStars,
  totalContributedRepos,
  mergedPRsPercentage
) {
  const COMMITS_WEIGHT = 3;
  const PRS_WEIGHT = 2;
  const STARS_WEIGHT = 2;
  const REPOS_WEIGHT = 1;
  const MERGED_PRS_WEIGHT = 1;

  const TOTAL_WEIGHT =
    COMMITS_WEIGHT +
    PRS_WEIGHT +
    STARS_WEIGHT +
    REPOS_WEIGHT +
    MERGED_PRS_WEIGHT;

  const THRESHOLDS = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];
  const LEVELS = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C"];

  const rank =
    (COMMITS_WEIGHT * totalCommits +
      PRS_WEIGHT * totalPRs +
      STARS_WEIGHT * totalStars +
      REPOS_WEIGHT * totalContributedRepos +
      MERGED_PRS_WEIGHT * mergedPRsPercentage) /
    TOTAL_WEIGHT;

  if (rank > 100) return "C";

  const level = LEVELS[THRESHOLDS.findIndex((t) => rank <= t)];
  return level;
}

const updateStats = async () => {
  const totalStars = await getTotalStars();
  const userStats = await getUserStats();
  const totalCommitsCurrentYear = await getTotalCommitsForCurrentYear();
  const totalCommitsForLastYear = await getTotalCommitsForLastYear();
  const totalCommits = await getTotalCommits();
  const { totalPRs, totalMergedPRs } = await getPRStats();
  const mergedPRsPercentage = totalPRs
    ? ((totalMergedPRs / totalPRs) * 100).toFixed(2)
    : 0;
  const totalContributedRepos = await getContributedRepos();
  const level = calculateRankLevel(
    totalCommits,
    totalPRs,
    totalStars,
    totalContributedRepos,
    mergedPRsPercentage
  );

  document.getElementById("total-stars-value").innerHTML = totalStars;
  document.getElementById("total-repos-value").textContent =
    userStats.totalRepositories;
  document.getElementById("following-value").textContent =
    userStats.totalFollowing;
  document.getElementById("followers-value").textContent =
    userStats.totalFollowers;
  // document.getElementById("total-commits-current-year").textContent =
  //   totalCommitsCurrentYear;
  // document.getElementById("total-commits-last-year").textContent =
  //   totalCommitsForLastYear;
  document.getElementById("total-commits").textContent = totalCommits;
  document.getElementById("total-prs").textContent = totalPRs;
  // document.getElementById("total-merged-prs").textContent = totalMergedPRs;
  // document.getElementById("merged-prs-percentage").textContent = `${mergedPRsPercentage} %`;
  document.getElementById("total-contributed-repos").textContent =
    totalContributedRepos;
  document.getElementById("rank").textContent = level;
};

// Main function to fetch and display stats
const displayStats = async () => {
  await updateStats();
};

// Call displayStats on page load
window.onload = displayStats;

{
  {
    /*  // Main function to display all stats
      const displayStats = async () => {
        const totalStars = await getTotalStars();
        const userStats = await getUserStats();
        const totalCommitsCurrentYear = await getTotalCommitsForCurrentYear();
        const totalCommitsForLastYear = await getTotalCommitsForLastYear();
        const totalCommits = await getTotalCommits();
        const { totalPRs, totalMergedPRs } = await getPRStats();
        const mergedPRsPercentage = totalPRs
          ? ((totalMergedPRs / totalPRs) * 100).toFixed(2)
          : 0;
        const totalContributedRepos = await getContributedRepos();
        const level = calculateRankLevel(
          totalCommits,
          totalPRs,
          totalStars,
          totalContributedRepos,
          mergedPRsPercentage
        );

        const statsDiv = document.getElementById("stats");
        statsDiv.innerHTML = `
        <p>Total Stars Earned: ${totalStars}</p>
        <p>Total Followers: ${userStats.totalFollowers}</p>
        <p>Total Following: ${userStats.totalFollowing}</p>
        <p>Total Repositories: ${userStats.totalRepositories}</p>
        <p>Total Commits (Current Year): ${totalCommitsCurrentYear}</p>
        <p>Total Commits (Last Year): ${totalCommitsForLastYear}</p>
        <p>Total Commits: ${totalCommits}</p>
        <p>Total PRs: ${totalPRs}</p>
        <p>Total PRs Merged: ${totalMergedPRs}</p>
        <p>Merged PRs Percentage: ${mergedPRsPercentage} %</p>
        <p>Total PRs Reviewed: 0</p>
        <p>Total Issues: 0</p>
        <p>Total Discussions Started: 0</p>
        <p>Total Discussions Answered: 0</p>
        <p>Contributed to (last year): ${totalContributedRepos}</p>
        <p>Rank: ${level}</p>
      `;
      };
      displayStats();  */
  }
}
