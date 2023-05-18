// Actions when pages are loaded.
document.addEventListener('DOMContentLoaded', async function () {
    current_page = window.location.pathname.split("/").pop();

    if (current_page == '' ||
        current_page == 'index.html' ||
        current_page == 'news.html' ||
        current_page == 'indexes.html' ||
        current_page == 'stocks.html' ||
        current_page == 'cryptocurrencies.html'
    ) {
        // Managing visibility of specific elements.
        current_user_firstname = localStorage.getItem('current_user_firstname');
        current_user_lastname = localStorage.getItem('current_user_lastname');

        if (current_user_firstname !== null && current_user_lastname !== null) {
            // When logged in
            document.getElementById('logged_in').style.visibility = 'visible';
            document.getElementById('logout_button').style.visibility = 'visible';
            if (current_page != 'index.html'){
                document.getElementById('logged_in_buttons').style.visibility = 'visible';
            }
            
            document.getElementById('logged_in_name').innerHTML = current_user_firstname;
            document.getElementById('logged_in_lastname').innerHTML = current_user_lastname;

            document.getElementById('login_button').style.visibility = 'hidden';
            document.getElementById('register_button').style.visibility = 'hidden';
        } else {
            // When logged out
            document.getElementById('logged_in').style.visibility = 'hidden';
            document.getElementById('logout_button').style.visibility = 'hidden';

            document.getElementById('logged_in_name').innerHTML = '';
            document.getElementById('logged_in_lastname').innerHTML = '';

            document.getElementById('login_button').style.visibility = 'visible';
            document.getElementById('register_button').style.visibility = 'visible';
        }
    }

    // Load services data on loading page
    if (current_page == 'news.html') {
        let news_data = await fetch('http://localhost:5000/upload_news')
            .then(response => response.json());

        let news_titles = news_data['news_titles'];
        let news_titles_urls = news_data['news_urls'];

        load_news_table_data(news_titles, news_titles_urls);
    } else if (current_page == 'indexes.html') {
        let indexes_data = await fetch('http://localhost:5000/upload_indexes')
            .then(response => response.json())
            .then(data => data['data']);

        console.log(indexes_data);

        load_indexes_table_data(indexes_data);
    } else if (current_page == 'stocks.html') {
        let stocks_data = await fetch('http://localhost:5000/upload_stocks')
            .then(response => response.json())
            .then(data => data['data']);

        load_stocks_table_data(stocks_data);
    }
});

// Load function for news
function load_news_table_data(news_titles, news_titles_urls) {
    const table = document.getElementById("news_table");
    table.deleteRow(0);

    news_titles.forEach((item, index) => {
        let row = table.insertRow();
        let cell = row.insertCell(0);
        cell.innerHTML = '<a href="' + news_titles_urls[index] + '" target="_blank">' + (index + 1) + '. ' + item + '</a>';
    });
}

// Load function for indexes
function load_indexes_table_data(indexes_data) {
    const table = document.getElementById("indexes_table");
    table.deleteRow(0);

    for (var index in indexes_data) {
        let row = table.insertRow();
        let cell_name = row.insertCell(0);
        let cell_price = row.insertCell(1);
        let cell_change_usd = row.insertCell(2);
        let cell_change_percentage = row.insertCell(3);

        cell_name.innerHTML = indexes_data[index][0];
        cell_price.innerHTML = indexes_data[index][1];
        cell_change_usd.innerHTML = indexes_data[index][2];
        cell_change_percentage.innerHTML = indexes_data[index][3];
    }
}

// Load function for stocks
function load_stocks_table_data(stocks_data) {
    const table = document.getElementById("stocks_table");
    table.deleteRow(0);

    let info_row = table.insertRow();
    let cell_info = info_row.insertCell(0);
    cell_info.innerHTML = 'Акції або фонди з найвищим обсягом торгів на поточній сесії.'

    for (var index in stocks_data) {
        let row = table.insertRow();
        let cell_name = row.insertCell(0);
        let cell_price = row.insertCell(1);
        let cell_change_usd = row.insertCell(2);
        let cell_change_percentage = row.insertCell(3);

        cell_name.innerHTML = stocks_data[index][0];
        cell_price.innerHTML = stocks_data[index][1];
        cell_change_usd.innerHTML = stocks_data[index][2];
        cell_change_percentage.innerHTML = stocks_data[index][3];
    }
}

// Load function for cryptocurrencies
async function load_cryptocurrency_data() {
    let symbol = document.getElementById('input_cryptocurrency').value;

    let coin_data = await fetch('http://localhost:5000/upload_cryptocurrency', {
        method: 'POST',
        body: JSON.stringify({ sym: symbol }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => data['data']);

    const table = document.getElementById("cryptocurrency_table");

    var row_count = table.rows.length;

    if (coin_data == 0) {
        document.getElementById("categories").innerHTML = 'Введено не існуючу назву криптовалюти';
    } else if (coin_data == 1) {
        document.getElementById("categories").innerHTML = 'Сервер перенавантажено. Спробуйте пізніше.';
    } else {
        if (row_count <= 1) {
            let info_row = table.insertRow();

            info_row.insertCell(0).innerHTML = '';
            info_row.insertCell(1).innerHTML = 'Ціна, USD';
            info_row.insertCell(2).innerHTML = 'Ціна, UAH';
            info_row.insertCell(3).innerHTML = 'Зміна за 1 день, %';
            info_row.insertCell(4).innerHTML = 'Зміна за 1 тиждень, %';
        }

        let price_row = table.insertRow();
        let symbol_cell = price_row.insertCell(0)
        let current_price_usd_cell = price_row.insertCell(1);
        let current_price_uah_cell = price_row.insertCell(2);
        let price_change_percentage_24h_cell = price_row.insertCell(3);
        let price_change_percentage_7d_cell = price_row.insertCell(4);

        let symbol_upper = coin_data['symbol'].toUpperCase();
        symbol_cell.innerHTML = symbol_upper
        current_price_usd_cell.innerHTML = coin_data['market_data']['current_price']['usd'].toFixed(2) + ' $';
        current_price_uah_cell.innerHTML = coin_data['market_data']['current_price']['uah'].toFixed(2) + ' грн.';
        price_change_percentage_24h_cell.innerHTML = coin_data['market_data']['price_change_percentage_24h'].toFixed(2) + '%';
        price_change_percentage_7d_cell.innerHTML = coin_data['market_data']['price_change_percentage_7d'].toFixed(2) + '%';

        document.getElementById("categories").innerHTML = 'Характеристика ' + symbol_upper + ': ' + coin_data['categories'];
    }
}

// Check if email has such syntax: smth@smth.smth
function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

// Entering into account
async function log_in() {
    let user_email_text = document.getElementById('user_email_text').value;
    let user_password_text = document.getElementById('user_password_text').value;

    if (user_email_text == '' || user_password_text == '') {
        document.getElementById('register_error_text').innerHTML = 'Заповніть усі поля';
    } else {
        let user_info = {
            user_email: user_email_text,
            user_password: user_password_text,
            type: 'login'
        }

        let full_user_info = await fetch('http://localhost:5000/get_user', {
            method: 'POST',
            body: JSON.stringify(user_info),
            headers: { 'Content-Type': 'application/json' }
        }).then(response => response.json())
        .then(data => data['data'][0]);

        console.log(full_user_info);

        user_firstname = full_user_info['user_firstname'];
        user_lastname = full_user_info['user_lastname'];

        console.log(user_firstname);
        console.log(user_lastname);

        location.href = 'index.html';

        localStorage.setItem('current_user_firstname', user_firstname);
        localStorage.setItem('current_user_lastname', user_lastname);
    }
}

// Recover password
async function recover_password(){
    let user_firstname_text = document.getElementById('recover_firstname_input').value;
    let user_lastname_text = document.getElementById('recover_lastname_input').value;
    let user_email_text = document.getElementById('recover_email_input').value;
    
    if (user_firstname_text == '' || user_lastname_text == '' || user_email_text == '') {
        document.getElementById('register_error_text').innerHTML = 'Заповніть усі поля';
    } else{
        let user_info = {
            user_firstname: user_firstname_text,
            user_lastname: user_lastname_text,
            user_email: user_email_text,
            type: 'recover'
        }

        let full_user_info = await fetch('http://localhost:5000/get_user', {
            method: 'POST',
            body: JSON.stringify(user_info),
            headers: { 'Content-Type': 'application/json' }
        }).then(response => response.json())
        .then(data => data['data'][0]);

        if (!full_user_info){
            document.getElementById('register_error_text').innerHTML = 'Користувача не знайдено';
        } else{
            document.getElementById('register_error_text').style.color = 'lime';
            document.getElementById('register_error_text').innerHTML = 'Ваш пароль: "' + full_user_info['user_password'] + '"';
        }
    }
}

// Add new user to database / Register
function add_user() {
    let user_firstname_text = document.getElementById('user_firstname_text').value;
    let user_lastname_text = document.getElementById('user_lastname_text').value;
    let user_email_text = document.getElementById('user_email_text').value;
    let user_password_1_text = document.getElementById('user_password_1_text').value;
    let user_password_2_text = document.getElementById('user_password_2_text').value;

    if (user_firstname_text == '' ||
        user_lastname_text == '' ||
        user_email_text == '' ||
        user_password_1_text == '' ||
        user_password_2_text == ''
    ) {
        document.getElementById('register_error_text').innerHTML = 'Заповніть усі поля';
    } else if (!validateEmail(user_email_text)) {
        document.getElementById('register_error_text').innerHTML = 'Введено не правильну пошту. Формат: text@text.text';
    } else if (user_password_1_text != user_password_2_text) {
        document.getElementById('register_error_text').innerHTML = 'Паролі не співпадають';
    } else if (user_password_1_text.length < 8) {
        document.getElementById('register_error_text').innerHTML = 'Довжина пароля має бути більше 8-ми символів';
    } else {
        let user_info = {
            user_firstname: user_firstname_text,
            user_lastname: user_lastname_text,
            user_email: user_email_text,
            user_password: user_password_1_text
        }

        fetch('http://localhost:5000/add_user', {
            method: 'POST',
            body: JSON.stringify(user_info),
            headers: { 'Content-Type': 'application/json' }
        }).then(response => response.json());

        localStorage.setItem('current_user_firstname', user_firstname_text);
        localStorage.setItem('current_user_lastname', user_lastname_text);

        location.href = 'index.html';
    }
}

// Loggint out
function log_out() {
    localStorage.removeItem('current_user_firstname');
    localStorage.removeItem('current_user_lastname');

    location.href = 'index.html';
}

// If user tries to get into services pages, so give him an alert message.
function is_logged_in_alert() {
    current_user_firstname = localStorage.getItem('current_user_firstname');
    current_user_lastname = localStorage.getItem('current_user_lastname');

    if (current_user_firstname == null || current_user_lastname == null) {
        window.alert('Авторизуйтесь для продовження');
        return false;
    }
    return true;
}

/* Functions to move to services */
function to_news() {
    if (!is_logged_in_alert()) {
        return;
    }

    location.href = 'news.html';
}

function to_indexes() {
    if (!is_logged_in_alert()) {
        return;
    }

    location.href = 'indexes.html';
}

function to_stocks() {
    if (!is_logged_in_alert()) {
        return;
    }

    location.href = 'stocks.html';
}

function to_cryptocurrencies() {
    if (!is_logged_in_alert()) {
        return;
    }

    location.href = 'cryptocurrencies.html';
}