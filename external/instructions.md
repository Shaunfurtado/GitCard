## Create Your Personalized GitHub Card

This guide walks you through creating a visually appealing GitHub card that showcases your contributions.

**Prerequisites:**

- A GitHub account

**Steps:**

1. **Obtain Your GitHub Username and Personal Access Token:**

   - **Username:** Log in to your GitHub account and visit your profile page. Your username will be displayed prominently.
   - **Personal Access Token:**
     1. Go to your GitHub settings ([https://github.com/settings/tokens](https://github.com/settings/tokens)).
     2. Click on "Generate new token."
     3. Provide a descriptive name for the token (e.g., "Gitcard Project").
     4. Select the scopes you need (at a minimum, `repo`). You can find details about scopes on the GitHub documentation page.
     5. Click on "Generate token" and copy the generated token value. **Important:** Keep this token confidential as it grants access to your GitHub account.

2. **Modify `stats.js`:**

   - Open the `stats.js` file in your code editor.
   - Locate the lines where your GitHub username and personal access token are defined. Replace the placeholder values with your actual credentials obtained in step 1.
   - **Important:** **Do not** commit your personal access token to a public repository. Consider storing it securely in an environment variable.

3. **Run Data Processing Scripts:**

    *Scripts are located at `external` folder*

<details>

  **Note:**

  This process utilizes external services or public APIs to retrieve some data points that are not natively available through the official GitHub API. These additional data points might enhance the richness of your Gitcard. 

  **Credits:**

  We acknowledge and appreciate the work done by the developer behind the project [github-readme-streak-stats](https://github.com/DenverCoder1/github-readme-streak-stats) by [DenverCoder1](https://github.com/DenverCoder1/). This project provides valuable insights into GitHub contribution patterns, which can be leveraged to generate a more comprehensive Gitcard.

  This Gitcard creator utilizes the following services to obtain data:

  - **GitHub Readme Streak Stats:** Provides information about your GitHub contribution streaks.

</details>

   **Windows with PowerShell:**

     1. Open a PowerShell window in your project directory.
     2. Execute the following command, replacing `<path/to/process_data.ps1>` with the actual path to your script:

        ```bash
        .\process_data.ps1
        ```

     3. If you encounter any errors related to execution policy, run this command first:

        ```bash
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
        ```

   **Mac/Linux:**

     1. Open a terminal window in your project directory.
     2. Make the script executable using the following command:

        ```bash
        chmod +x process_data.sh
        ```

     3. Run the script using:

        ```bash
        ./process_data.sh
        ```

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