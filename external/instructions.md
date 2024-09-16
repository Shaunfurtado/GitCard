## Create Your Personalized GitHub Card

This guide walks you through creating a visually appealing GitHub card that showcases your contributions.

**Prerequisites:**

- A GitHub account
- Node.js

**Steps:**

1. **Obtain Your GitHub Username and Personal Access Token:**

   - **Username:** Log in to your GitHub account and visit your profile page. Your username will be displayed prominently.
   - **Personal Access Token:**
     1. Go to your GitHub settings ([https://github.com/settings/tokens](https://github.com/settings/tokens)).
     2. Click on "Generate new token."
     3. Provide a descriptive name for the token (e.g., "Gitcard Project").
     4. Select the scopes you need (at a minimum, `repo`). You can find details about scopes on the GitHub documentation page.
     5. Click on "Generate token" and copy the generated token value. **Important:** Keep this token confidential as it grants access to your GitHub account.

2. **Run Data Processing Scripts:**

   <details>

   **Note:**

   This process utilizes external services or public APIs to retrieve some data points that are not natively available through the official GitHub API. These additional data points might enhance the richness of your Gitcard. 

   **Credits:**

   We acknowledge and appreciate the work done by the developer behind the project [github-readme-streak-stats](https://github.com/DenverCoder1/github-readme-streak-stats) by [DenverCoder1](https://github.com/DenverCoder1/). This project provides valuable insights into GitHub contribution patterns, which can be leveraged to generate a more comprehensive Gitcard.

   This Gitcard creator utilizes the following services to obtain data:

   - **GitHub Readme Streak Stats:** Provides information about your GitHub contribution streaks.

   </details>
   <br>

      **Node.js:**

         1. Open a Terminal window in project repository.
         2. Execute the following command:

            node script.js your-github-username 


3. **Open `index.html` in live server:**

   - Enter Your Github Username and Github Private Token.


4. **View Your GitHub Card:**

   - Open `index.html` in your web browser or directly within your code editor's browser preview.
   - The script should have populated the card with your GitHub data, including your username, repository statistics, and more.

5. **Export Your Card as SVG:**

   - Click the "Export SVG" button displayed on the card.
   - Save the downloaded SVG file.

**Using the SVG:**

- You can now embed the exported SVG file into any website or Markdown file using the `<img>` tag:

  ```html
  <img src="path/to/your/github_card.svg" alt="Your GitHub Card">
  ```

**Additional Notes:**

- If you encounter errors during the data processing steps, ensure your script has the necessary permissions to access your GitHub account using the provided personal access token. Refer to the script's code or documentation for more details.