const GITHUB_USERNAME = "GITHUB_USERNAME";
const GITHUB_TOKEN = "GITHUB_TOKEN";

const currentYear = new Date().getFullYear();
const previousYear = currentYear - 1;

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

const formatDate = (date) => {
  const options = { month: "short", day: "numeric", year: "numeric" };
  return date.toLocaleDateString(undefined, options);
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
  const totalPublicRepos = userProfile.public_repos;
  const totalPrivateRepos = userProfile.total_private_repos;
  const totalRepositories = totalPublicRepos + totalPrivateRepos;
  const profilePictureUrl = userProfile.avatar_url;
  const username = userProfile.login;
  const fullName = userProfile.name;
  const bio = userProfile.bio;
  

  const usernameElement = document.getElementById("username");
  const fullNameElement = document.getElementById("full-name");
  const bioElement = document.getElementById("bio");
  const profilePictureElement = document.getElementById("profile-picture");

  usernameElement.textContent = username;
  fullNameElement.textContent = fullName;
  bioElement.textContent = bio;

  profilePictureElement.src = profilePictureUrl;

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

let totalCommits;

function mapDataToElements(data) {
  const [totalCommitsData, joinedDate, longestStreak, streakDuration] = data;
  totalCommits = totalCommitsData
  document.getElementById("total-commits").textContent = totalCommits;
  const joinedDateElement = document.getElementById("joined-date");
  joinedDateElement.textContent = joinedDate;
  document.getElementById("longest-streak").textContent = longestStreak;
  document.getElementById("streak-duration").textContent = streakDuration;
}

fetch("./external/final_output.txt")
  .then(response => response.json()) // Assuming output.txt is a JSON file
  .then(data => {
    mapDataToElements(data);
  })
  .catch(error => {
    console.error("Error fetching or parsing data:", error);
  });

async function getTotalCommitsForYear(year) {
  // Fetch all repositories (both public and private)
  const repos = await githubRequest(
    `https://api.github.com/user/repos?per_page=100`,
    GITHUB_TOKEN
  );
  if (!repos) return 0;

  const totalCommits = await Promise.all(
    repos.map(async (repo) => {
      let allCommits = [];
      const startDateString = `${year}-01-01T00:00:00Z`;
      let endDateString;

      // Handle case where year is current year
      if (year === new Date().getFullYear()) {
        endDateString = new Date().toISOString().split('T')[0] + 'T23:59:59Z'; // Until today
      } else {
        endDateString = `${year}-12-31T23:59:59Z`; // Until December 31st of the year
      }

      let nextPageUrl = `${repo.url}/commits?since=${startDateString}&until=${endDateString}&per_page=100`;

      // Loop through all pages of commits for the specified year
      while (nextPageUrl) {
        const pageData = await githubRequest(nextPageUrl, GITHUB_TOKEN);
        allCommits = allCommits.concat(pageData);
        nextPageUrl = getNextPageUrl(pageData.links);
      }

      return allCommits.length;
    })
  );

  return totalCommits.reduce((acc, commits) => acc + commits, 0);
}

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
    `https://api.github.com/search/issues?q=type:pr+author:${GITHUB_USERNAME}+created:>2016-01-01`
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
  // const totalCommitsCurrentYear = await getTotalCommitsForYear(currentYear);
  const totalCommitsForLastYear = await getTotalCommitsForYear(previousYear);
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
  document.getElementById("total-repos-value").textContent = userStats.totalRepositories;
  document.getElementById("following-value").textContent = userStats.totalFollowing;
  document.getElementById("followers-value").textContent = userStats.totalFollowers;
  // document.getElementById("total-commits-current-year").textContent = totalCommitsCurrentYear;
  document.getElementById("total-commits-last-year").textContent = totalCommitsForLastYear;
  document.getElementById("total-prs").textContent = totalPRs;
  // document.getElementById("total-merged-prs").textContent = totalMergedPRs;
  // document.getElementById("merged-prs-percentage").textContent = `${mergedPRsPercentage} %`;
  document.getElementById("total-contributed-repos").textContent = totalContributedRepos;
  document.getElementById("rank").textContent = level;
};

// Main function to fetch and display stats
const displayStats = async () => {
  await updateStats();
};

// Call displayStats on page load
window.onload = displayStats;