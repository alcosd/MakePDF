const webdriver = require('selenium-webdriver');
const puppeteer = require('puppeteer');
const {Builder, By, until} = webdriver;
const { promisify } = require('util');
const fs = require('fs');
const filePath = __dirname + '/output/output.jpg';
const pdfPath = __dirname + '/output/output.pdf';
const capabilities = webdriver.Capabilities.chrome();
//
const express = require('express');
const { uuid } = require('uuidv4');
const multer = require('multer');
const app = express();
const list = [];
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname));
app.use(multer().none());  //formdataを解釈するよう
app.get('/', (req, res) => {
    res.sendFile(__dirname+'/index.html');
});

app.get('/api/url/add', (req, res) => {
    res.json(list);
})

app.post('/api/url/add', (req, res) => {
    const data = req.body;
    const url = data.url;
    console.log(url);
    const id = uuid();
    const item = {
        id,
        url: url,
        done: false,
    }
    list.push(item);
    //クライアントに返す
    // res.json(item);
    saveWebSiteAsPDF(url).then(() => {
        res.sendFile(pdfPath, (err) => {
            if(err) {
                res.status(500).send('Error sending file');
            }
        });
    })
    .catch((err) => {
        console.log(err);
    })
})

app.listen(5000, () => {
    console.log('server is running');
})

//
capabilities.set('chromeOptions', {
    args: [
        '--headless', 
        '--no-sandbox',
        '--disable-gpu',
        '--window-size=1980,1200'
    ],
    w3c: false
});

async function screenShot(URL) {
    //withcapabilities状態でブラウザを起動
    const driver = await new Builder().withCapabilities(capabilities).build();

    try{
        await driver.get(URL);
    
        //フルスクリーン設定
        const windowSize = await driver.manage().window().getSize();
        const pageHeight = await driver.executeScript('return document.body.scrollHeight');
        console.log(windowSize, pageHeight);
        await driver.manage().window().setSize({ width: windowSize.width, height: pageHeight});
    
        let base64 = await driver.takeScreenshot();
        let buffer = Buffer.from(base64, 'base64');
        //保存
        await promisify(fs.writeFile)(filePath, buffer);
    }
    catch(error){
        console.log(error);
    }
    finally{
        //すでにブラウザを開いているので必ず閉じる
        driver.quit();
    }
}

//asyncを使うときcatchで例外処理を行う
// screenShot('https://stackoverflow.com/questions/43096342/selenium-node-driver-manage-window-setpositionnew-pointx-y-not-having-a').catch(console.error());

async function saveWebSiteAsPDF(URL) { 
    const browser = await puppeteer.launch({
        headless: 'new',
    });
    const page = await browser.newPage();

    try{
        await page.goto(URL);
        await page.pdf({ path: pdfPath, format: 'A4' });
    }
    catch(err){
        console.log(err);        
    }
    finally{
        await browser.close();
    }
}

// saveWebSiteAsPDF('https://qiita.com/cozy16/items/9448203691e206072558').catch(console.error());