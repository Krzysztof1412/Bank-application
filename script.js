'use strict';

const users = [
  {
    name: 'chris',
    password: 'chris10',
    movements: [250, 100, -800, 500, 1500, -300, 750],
    cards: ['48376473840374184'],
    currency: 'PLN',
    locale: 'pl-PL',
  },
  {
    name: 'json',
    password: 'jsgod',
    movements: [10000, 4000, -500, 600, 1000, 14000],
    cards: ['3840937395883795', '3749285736193846'],
    currency: 'USD',
    locale: 'en-US',
  },
  {
    name: 'jessica',
    password: 'jessy70',
    movements: [100, 200, 300, -50, 150, -200],
    cards: ['374917365728395736', '37291038475628496', '1039485721859384'],
    currency: 'EUR',
    locale: 'de-DE',
  },
];

const loginToAccount = function () {
  const login = document.querySelector('.login-input input').value;
  const password = document.querySelector('.password-input input').value;

  const foundUser = users.find(user => user.name === login);

  if (foundUser && foundUser.password === password) {
    const failedLog = document.querySelector('.failed-log');
    failedLog.textContent = '';

    const hiddenContent = document.querySelectorAll('.hidden');
    hiddenContent.forEach(el => el.classList.remove('hidden'));

    const loginSection = document.querySelector('.login-section');
    loginSection.classList.add('hidden');

    const demoAccounts = document.querySelector('.accounts');
    demoAccounts.classList.add('hidden');

    document.title = 'Forest Bank - Control panel';

    updateUI(foundUser);

    const transferMoneyBind = transferMoney.bind(null, foundUser);
    const despositMoneyBind = depositMoney.bind(null, foundUser);

    const transferButton = document.querySelector('#transfer-money');
    transferButton.addEventListener('click', transferMoneyBind);

    const depositButton = document.querySelector('#deposit-money');
    depositButton.addEventListener('click', despositMoneyBind);

    const logOutButton = document.querySelector('.log-out');
    logOutButton.addEventListener(
      'click',
      logOut.bind(
        null,
        transferButton,
        depositButton,
        transferMoneyBind,
        despositMoneyBind
      ),
      { once: true }
    );
  } else {
    const failSpan = document.querySelector('.failed-log');
    failSpan.textContent = 'Incorrect login or password.';
  }
};

const updateUI = function (user) {
  const savings = user.movements.reduce((acc, sum) => acc + sum, 0);
  const savingsElement = document.querySelector('.savings');
  savingsElement.textContent = new Intl.NumberFormat(user.locale, {
    style: 'currency',
    currency: user.currency,
  }).format(savings);

  const numberOfCards = user.cards;
  const creditCardsElement = document.querySelector('#credit-cards');
  creditCardsElement.innerHTML = '';

  numberOfCards.forEach(card => {
    const cardNumber = document.createElement('p');
    cardNumber.textContent = card.slice(-4).padStart(16, '*');
    cardNumber.classList.add('credit-card-number');
    creditCardsElement.appendChild(cardNumber);
  });

  const activitiesBox = document.querySelector('.activities-box');
  activitiesBox.innerHTML = '';
  user.movements.forEach((move, i) => {
    const transactionType = move > 0 ? 'Deposit' : 'Withdrawal';
    const html = `
      <div class="activity ${transactionType.toLowerCase()}">
        <p class="left-lp"><span>${i + 1}</span></p>
        <p class="type"><span>${transactionType}</span></p>
        <p class="right-value"><span>${new Intl.NumberFormat(user.locale, {
          style: 'currency',
          currency: user.currency,
        }).format(move)}</span></p>
      </div>
    `;
    activitiesBox.insertAdjacentHTML('afterbegin', html);
  });
};

const transferMoney = function (user) {
  const plnExchangeRate = {
    ['USD']: 4.5,
    ['EUR']: 4.7,
  };

  const usdExchangeRate = {
    ['PLN']: 0.22,
    ['EUR']: 1.05,
  };

  const eurExchangeRate = {
    ['USD']: 0.22,
    ['PLN']: 0.21,
  };

  const receiver = document.querySelector('#receiver').value;
  const value = document.querySelector('#transfer-value').value;
  const transferInfo = document.querySelector('.transfer-info');
  transferInfo.textContent = '';

  if (receiver === user.name) {
    transferInfo.textContent = 'You can not send your funds to yourself!';
    return;
  }

  if (value < 1) {
    transferInfo.textContent = `Minimal value is 1 ${user.currency}`;
    return;
  }

  if (value > user.movements.reduce((acc, sum) => acc + sum, 0)) {
    transferInfo.textContent = 'You can not send more than you have!';
    return;
  }

  const foundReceiver = users.find(user => user.name === receiver);
  let exchangeRate;

  if (foundReceiver) {
    switch (foundReceiver.currency) {
      case 'PLN':
        exchangeRate = plnExchangeRate;
        break;
      case 'USD':
        exchangeRate = usdExchangeRate;
        break;
      case 'EUR':
        exchangeRate = eurExchangeRate;
        break;
    }
    user.movements.push(-value);
    foundReceiver.movements.push(+value * exchangeRate[user.currency]);
    updateUI(user);
  } else transferInfo.textContent = 'This receiver does not exist!';
};

const depositMoney = function (user) {
  const value = document.querySelector('#deposit-value').value;
  const depositInfo = document.querySelector('.deposit-info');

  if (value < 0.01) {
    depositInfo.textContent = `Minimal deposit is 0.01 ${user.currency}`;
    return;
  }

  user.movements.push(+value);
  updateUI(user);
};

const logOut = function (
  transferButton,
  depositButton,
  transferMoney,
  depositMoney
) {
  const hiddenContent = document.querySelector('.hidden');
  hiddenContent.classList.remove('hidden');

  const mainContent = document.querySelectorAll('header, main');
  mainContent.forEach(el => el.classList.add('hidden'));

  const transferInfo = document.querySelector('.transfer-info');
  const depositInfo = document.querySelector('.deposit-info');

  transferInfo.textContent = depositInfo.textContent = '';

  const receiver = document.querySelector('#receiver');
  const transferValue = document.querySelector('#transfer-value');
  const depositValue = document.querySelector('#deposit-value');
  const login = document.querySelector('.login-input input');
  const password = document.querySelector('.password-input input');

  receiver.value =
    transferValue.value =
    depositValue.value =
    login.value =
    password.value =
      '';

  const demoAccounts = document.querySelector('.accounts');
  demoAccounts.classList.remove('hidden');

  document.title = 'Forest Bank - Log in';

  transferButton.removeEventListener('click', transferMoney);
  depositButton.removeEventListener('click', depositMoney);
};

const loginButton = document.querySelector('#login-button');
loginButton.addEventListener('click', function (e) {
  e.preventDefault();

  loginToAccount();
});
