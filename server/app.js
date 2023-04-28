// npm run start:nodemon
const coin_list = require('./coin_list.json')
const body_parser = require('body-parser');
const puppeteer = require('puppeteer');
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();

app.use(cors())
app.use(body_parser.json())

// Database connection data
const database_access = {
    host: "localhost",
    user: "root",
    database: "website",
    password: "13487S_PQL",
};

/* Structure of table of users */
// CREATE TABLE users (
// 	user_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
//     user_firstname VARCHAR(256) NOT NULL,
//     user_lastname VARCHAR(256) NOT NULL,
//     user_email VARCHAR(256) NOT NULL,
//     user_password VARCHAR(256) NOT NULL
// )

// Upload news data on news.html
app.get('/upload_news', async (request, response) => {
    console.log('Getting news data...');

    const browser = await puppeteer.launch(
        {
            headless: "new"
        }
    );
    const page = await browser.newPage();

    await page.goto('https://finviz.com/news.ashx');

    let dates = await page.$$eval('.table-fixed tbody > tr', dates => {
        dates = dates.map(el => el.querySelector('.nn-date').textContent);
        return dates;
    });

    let titles = await page.$$eval('.table-fixed tbody > tr', titles => {
        titles = titles.map(el => el.querySelector('td > a').textContent);
        return titles;
    });

    let urls = await page.$$eval('.table-fixed tbody > tr', urls => {
        urls = urls.map(el => el.querySelector('td > a').href);
        return urls;
    });

    await browser.close();

    response.json({
        news_titles: dates.map(
            function (d, i) {
                try {
                    let first_part = d.split(':')[0];
                    let second_part = d.split(':')[1].slice(0, 2);

                    return String(Number(first_part) + 7) + ':' + second_part + ' ' + String(titles[i]);
                } catch (error) {
                    return d + ' ' + titles[i];
                }
            }
        ),
        news_urls: urls
    })
});

// Upload indexes data on indexes.html
app.get('/upload_indexes', async (request, response) => {
    console.log('Getting indexes data...');

    const browser = await puppeteer.launch(
        {
            headless: "new"
        }
    );
    const page = await browser.newPage();

    await page.goto('https://www.google.com/finance/markets/indexes');

    await page.waitForSelector('ul');

    const indexes_data = await page.evaluate(() => {
        const data = { 'titles': ['Назва індексу', 'Ціна, $', 'Зміна/добу, $', 'Зміна/добу, %'] };
        const rows = document.querySelectorAll('ul li');

        rows.forEach(row => {
            const title = row.querySelector('li a div .ZvmM7').textContent;

            const price = row.querySelector('li a div .YMlKec').textContent;
            const price_change_usd = row.querySelector('li a div .P2Luy').textContent;
            const price_change_percentage = row.querySelector('li a div .JwB6zf').textContent;

            data[title] = [title, price, price_change_usd, price_change_percentage];
        });

        return data;
    });

    await browser.close();

    response.json({
        data: indexes_data
    });
});

// Upload stocks data on stocks.html
app.get('/upload_stocks', async (request, response) => {
    console.log('Getting stocks data...');

    const browser = await puppeteer.launch(
        {
            headless: "new"
        }
    );
    const page = await browser.newPage();

    await page.goto('https://www.google.com/finance/markets/most-active');

    await page.waitForSelector('ul');

    const stocks_data = await page.evaluate(() => {
        const data = { 'titles': ['Назва активу', 'Ціна', 'Зміна/добу', 'Зміна/добу'] };
        const rows = document.querySelectorAll('ul li');

        rows.forEach(row => {
            const symbol = row.querySelector('li a div .COaKTb').textContent;
            const title = row.querySelector('li a div .ZvmM7').textContent;

            const price = row.querySelector('li a div .YMlKec').textContent;
            const price_change_usd = row.querySelector('li a div .P2Luy').textContent;
            const price_change_percentage = row.querySelector('li a div .JwB6zf').textContent;

            data[symbol] = [symbol + ' | ' + title, price, price_change_usd, price_change_percentage];
        });

        return data;
    });

    await browser.close();

    response.json({
        data: stocks_data
    });
});

// Upload cryptocurrency data on cryptocurrency.html
app.post('/upload_cryptocurrency', async (request, response) => {
    console.log('Getting cryptocurrency data...');

    let symbol = request.body['sym'];

    if (String(symbol).trim() == '') {
        response.json({
            data: 0
        });
    } else {
        let cryptocurrency_id = '';

        for (var index in coin_list) {
            if (coin_list[index]['id'] == symbol || coin_list[index]['symbol'] == symbol) {
                cryptocurrency_id = coin_list[index]['id'];
                break;
            }
        }

        if (cryptocurrency_id == '') {
            response.json({
                data: 0
            });
        } else {
            let coin_data = await fetch(
                'https://api.coingecko.com/api/v3/coins/' + cryptocurrency_id + '?localization=false&tickers=false&community_data=false&developer_data=false'
            )
                .then(response => response.json());

            try {
                console.log(coin_data['status']['error_code'])
                response.json({
                    data: 1
                });
                return;
            } catch (error) {
                response.json({
                    data: coin_data
                });
            }
        }
    }
});

// Get user by email and password when loggin in.
app.post('/get_user', (request, response) => {
    console.log('Getting user data...')

    let user_info = request.body

    const connection = mysql.createConnection(database_access);

    connection.connect((err) => {
        if (err) {
            console.log(err);
        }
        console.log('Database: ' + connection.state);
    });

    let query;

    if (user_info['type'] === 'login'){
        query = "SELECT * FROM users " +
                "WHERE user_email = '" + user_info['user_email'] +
                "' AND user_password = " + user_info['user_password']
    } else if (user_info['type'] === 'recover'){
        query = "SELECT * FROM users " +
                "WHERE user_email = '" + user_info['user_email'] +
                "' AND user_firstname = '" + user_info['user_firstname'] +
                "' AND user_lastname = '" + user_info['user_lastname'] + '\''
    }

    connection.query(query, (err, result, field) => {
        console.log(err);

        response.json({
            data: result
        });
    });

    connection.end();
});

// Add new user when registering.
app.post('/add_user', (request, response) => {
    console.log('Adding user...')

    let user_info = request.body

    const connection = mysql.createConnection(database_access);

    connection.connect((err) => {
        if (err) {
            console.log(err);
        }
        console.log('Database: ' + connection.state);
    });

    let query = "INSERT INTO users(user_firstname, user_lastname, user_email, user_password) " +
        "VALUES ('" + user_info['user_firstname'] + "', '" + user_info['user_lastname'] + " ', '" +
        user_info['user_email'] + "', '" + user_info['user_password'] + "');";

    connection.query(query, (err, result, field) => {
        console.log(err);

        response.json({
            data: result
        });
    });

    connection.end();
});

// Running server
app.listen(5000, (err) => {
    if (err) {
        return console.log(err);
    }

    console.log('Server is running at port 5000...');
});
