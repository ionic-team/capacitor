/*
var wd = require("wd");
var appDriver = wd.remote({
    hostname: '127.0.0.1',
    port: 4723,
})

var iosConfig = {
  automationName: 'Appium',
  autoWebview: true,
  browserName: '',
  platformName: 'iOS',
  platformVersion: '11.2',

}

appDriver.init(iosConfig)
    .sleep(3000)                         // Wait 3 seconds for the app to fully start
    .elementById('zip-code-input')       // Locate the text entry field
    .clear()                             // Clear its contents
    .sendKeys("95959")                   // Enter a value
    .elementById('get-weather-btn')      // Locate the Find Weather button
    .click()                             // Tap it 
    .sleep(5000)                         // Wait 5 seconds
    .quit();                             // Stop the app instead of waiting for a timeout  
*/

const wdio = require('webdriverio');

const opts = {
  port: 4723,
  desiredCapabilities: {
    platformName: "iOS",
    platformVersion: "11.2",
    deviceName: "iPhone 8 Plus",
    app: "/Users/max/Library/Developer/Xcode/DerivedData/App-bwsyklhjbyfcfjbtqfujvtpudyxb/Build/Products/Debug-iphonesimulator/App.app",
    automationName: "UiAutomator2"
  }
};

const client = wdio.remote(opts);

client
  .init()
  .click("~App")
  .click("~Alert Dialogs")
  .back()
  .back()
  .end();
