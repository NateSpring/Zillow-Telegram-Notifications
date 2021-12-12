const puppeteer = require('puppeteer-extra')
const TelegramBot = require('node-telegram-bot-api')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const randomUseragent = require('random-useragent');
// Fallback user agent incase the randomly set choice isn't valid.
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';

// Telegram Bot Setup
const token = '<Telegram Bot API Key>'
const chatId = '<Telegram Chat ID>'
const bot = new TelegramBot(token, { polling: false });

// Zillow link for
const link = '<URL for Zillow Search Query>'
/* Example link:
https://www.zillow.com/twin-falls-id-83301/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-115.01540159082032%2C%22east%22%3A-114.08019040917969%2C%22south%22%3A41.99849929253322%2C%22north%22%3A42.7946055062409%7D%2C%22regionSelection%22%3A%5B%7B%22regionId%22%3A94103%2C%22regionType%22%3A7%7D%5D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22price%22%3A%7B%22min%22%3A100000%2C%22max%22%3A349000%7D%2C%22mp%22%3A%7B%22min%22%3A335%2C%22max%22%3A1157%7D%2C%22ah%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22isListVisible%22%3Atrue%7D
*/

// Ability to manually check for new homes.
bot.onText(/\/check/, (msg) => {
    console.log('Check Zillow Command Fired @ ' + timeNow)
    searchZillow()
});

// Init variables for searchZillow function use.
let lastHouse = ''
let errCount = 0;
let searchDone = false;

// Meat and Potatoes; using Puppeteer to search Zillow 
const searchZillow = () => {
    searchDone = false;
    let d = new Date();
    let timeNow = d.toLocaleTimeString();

    puppeteer.launch({
        headless: true,
        // executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--aggressive-cache-discard',
            '--disable-cache',
            '--disable-application-cache',
            '--disable-offline-load-stale-cache',
            '--disable-gpu-shader-disk-cache',
            '--media-cache-size=0',
            '--disk-cache-size=0',]
    }).then(async browser => {
        console.log('*** Puppeteer Starting @', timeNow)
        // bot.sendMessage(chatId, 'Spinning up Puppeteer.');
        const userAgent = randomUseragent.getRandom();
        const UA = userAgent || USER_AGENT;
        const page = await browser.newPage()

        //Randomize viewport size
        await page.setViewport({
            width: 1920 + Math.floor(Math.random() * 100),
            height: 3000 + Math.floor(Math.random() * 100),
            deviceScaleFactor: 1,
            hasTouch: false,
            isLandscape: false,
            isMobile: false,
        });

        await page.setUserAgent(UA);
        await page.setJavaScriptEnabled(true);
        await page.setDefaultNavigationTimeout(0);

        // Skip images/styles/fonts loading for performance
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.evaluateOnNewDocument(() => {
            // Pass webdriver check
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
        });

        await page.evaluateOnNewDocument(() => {
            // Pass chrome check
            window.chrome = {
                runtime: {},
                // etc.
            };
        });

        await page.evaluateOnNewDocument(() => {
            //Pass notifications check
            const originalQuery = window.navigator.permissions.query;
            return window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
        });

        await page.evaluateOnNewDocument(() => {
            // Overwrite the `plugins` property to use a custom getter.
            Object.defineProperty(navigator, 'plugins', {
                // This just needs to have `length > 0` for the current test,
                // but we could mock the plugins too if necessary.
                get: () => [1, 2, 3, 4, 5],
            });
        });

        await page.evaluateOnNewDocument(() => {
            // Overwrite the `languages` property to use a custom getter.
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en'],
            });
        });

        console.log('- Loading Zillow.com')
        await page.goto(link)



        try {
            // Pull all homes from search query.
            const homesList = await page.$$('.photo-cards li');
            // Extract text from first home listed.
            const listing = await (await homesList[0].getProperty('innerText')).jsonValue();
            // console.log('Last House Found: ', listing.split('\n')[0]);

            /* 
            If listing is not the last house seen,
            send message via telegram bot (or your notification of choice).
            */
            if (listing.split('\n')[0] != lastHouse) {
                lastHouse = listing.split('\n')[0]
                bot.sendMessage(chatId, `New House Found: ${listing} \n Link: ${link}`);
                console.log('- Home Found -> Sending @ ', timeNow)
            } else {
                console.log('- No New Homes @ ', timeNow)
            }

        } catch (e) {
            // Error/Error count logging.
            errCount += 1
            console.log(`Error Count: ${errCount}\n${e}@ ${timeNow}`)
        }

        // Save screenshot of webpage.
        // await page.screenshot({ path: 'testresult.png', fullPage: true })

        await browser.close()

        // Send saved photo through telegram, then delete image (to save space on whatever device this runs on).
        // const photo = `${__dirname}/testresult.png`;
        // bot.sendPhoto(chatId, photo, {
        //     caption: "Zillow Finds"
        // });
        // // console.log(`All done, screenshot saved. ✨`)
        searchDone = true;
    })
}
console.log('*** ZillAuto: Start ***')
searchZillow()

// Check zillow for new homes every 30 seconds if the previous search is done.
setInterval(() => {
    if (searchDone == true) {
        console.log('Search is done, restarting script')
        searchZillow()
    }
}, 30000)
