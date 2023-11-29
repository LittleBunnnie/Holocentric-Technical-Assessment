const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
//Close Timer
const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

var content = "";

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto('https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login');

    // Login as Bank Manager
    await page.click('button[ng-click="manager()"]');

    // Function to add a customer
    async function addCustomer(firstName, lastName, postCode) {
        await page.click('button[ng-click="addCust()"]');
        await page.fill('input[ng-model="fName"]', firstName);
        await page.fill('input[ng-model="lName"]', lastName);
        await page.fill('input[ng-model="postCd"]', postCode);
        await page.click('button[type="submit"]');
        content += `${firstName} ${lastName} - ADDED` + "\n";
    }

    // Add customers
    const customers = [
        { firstName: 'Kyo', lastName: 'Kusanagi', postCode: 'L789C349' },
        { firstName: 'Kyo', lastName: 'Mina', postCode: 'M098Q585' },
        { firstName: 'Lola', lastName: 'Rose', postCode: 'A897N450' },
        { firstName: 'Jackson', lastName: 'Connely', postCode: 'L789C349' },
        { firstName: 'Mariotte', lastName: 'Tova', postCode: 'L789C349' }
    ];

    for (const customer of customers) {
        await addCustomer(customer.firstName, customer.lastName, customer.postCode);
    }

    // Go to Customers tab
    await page.click('button[ng-click="showCust()"]');

    // Wait for the table to be visible
    await page.waitForSelector('.table');

    // Verification logic: check if customers are in the table and print "OK" for each found customer
    for (const customer of customers) {
        // Construct a selector for the row that contains the customer's first name, last name, and postcode
        const customerRowSelector = `//tr[.//td[text()='${customer.firstName}'] and .//td[text()='${customer.lastName}']  and .//td[text()='${customer.postCode}']]`;
        const customerExists = await page.locator(customerRowSelector).count();
        if (customerExists > 0) {
            console.log(`${customer.firstName} ${customer.lastName} - FOUND`);
            content += `${customer.firstName} ${customer.lastName} - FOUND` + "\n";
        } else {
            console.log(`${customer.firstName} ${customer.lastName} - NOT FOUND`);
        }
    }



    // Function to delete a customer
    async function deleteCustomer(firstName, lastName, postCode) {
        // Construct a locator that finds the row containing the customer's details
        const customerRowSelector = `//tr[.//td[text()='${firstName}'] and .//td[text()='${lastName}']  and .//td[text()='${postCode}']]`;
        // Construct a selector for the delete button within that row
        const deleteButtonSelector = `${customerRowSelector}//button[text()='Delete']`;
        const buttonExists = await page.locator(deleteButtonSelector).count();
        if (buttonExists > 0) {
            await page.click(deleteButtonSelector);
            console.log(`${firstName} ${lastName} - DELETED`);
            content += `${firstName} ${lastName} - DELETED` + "\n";
        } else {
            console.log(`${firstName} ${lastName} - NOT FOUND`);
        }
    }

    // // Delete specific customers
    await deleteCustomer('Jackson', 'Connely', 'L789C349');
    await deleteCustomer('Mariotte', 'Tova', 'L789C349');

    //Generate Report
    const folderPath = path.join(__dirname, 'Report');
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }
    //Date
    const now = await new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // months are zero-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const formattedDate = `${year}${month}${day}_${hour}${minute}${second}`;

    const filePath = path.join(folderPath, 'Report_' + formattedDate + '.txt');
    fs.writeFile(filePath, content, err => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('File has been created');
    });

    // Close browser
    await delay(15000);
    await browser.close();
})();

