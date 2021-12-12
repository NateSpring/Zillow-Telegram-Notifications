# Zillow-Telegram-Notifications
Receive notifications through Telegram about new homes posted on Zillow via Puppeteer headless-browswer automation. 
This is best run from a Raspberry Pi or something that will allow it to run continuously.
###  ***If you're using this on a Raspberry Pi, uncomment line 39***

### Built With

This section should list any major frameworks/libraries used to bootstrap your project. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples.

* [Node.js]
* [Puppeteer]
* [Telegram] (Optional)


<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

_Below is an example of how you can instruct your audience on installing and setting up your app. This template doesn't rely on any external dependencies or services._

1. Get a free API Key at [https://example.com](https://example.com)
2. Clone the repo
   ```sh
   git clone https://github.com/NateSpring/Zillow-Telegram-Notifications.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Enter your Telegram API Key and Chat ID 
   ```js
   const token = '<Telegram Bot API Key>'
   const chatId = '<Telegram Chat ID>'
   ```
5. Enter your prequeried Zillow URL (example provided Line #16)
   ```js
   const link = '<URL for Zillow Search Query>'
   ```
6. Start Node Script
   ```sh
   node zill-check.js
   ```
<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
