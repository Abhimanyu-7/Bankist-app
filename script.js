'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2023-01-18T21:31:17.178Z',
    '2023-01-23T07:42:02.383Z',
    '2023-01-28T09:15:04.904Z',
    '2023-04-01T10:17:24.185Z',
    '2023-05-08T14:11:59.604Z',
    '2023-06-27T17:01:17.194Z',
    '2023-06-20T23:36:17.929Z',
    '2023-06-21T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2023-05-30T16:33:06.386Z',
    '2023-06-18T14:43:26.374Z',
    '2023-06-21T18:49:59.371Z',
    '2023-06-20T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date) {
  const calcdaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 3600 * 24));
  const daysPassed = calcdaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    const day = `${date.getDate()}`.padStart(2, 0);
    const month = `${date.getMonth() + 1}`.padStart(2, 0);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
};
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out.toFixed(2))}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogoutTimer = function () {
  const tick = function () {
    // call the timer every second

    const min = String(Math.floor(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // on each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;
    //Decrease the time

    // When at 0, stop the timer and logout the user
    if (time == 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log In to get started';
      containerApp.style.opacity = 0;
    }
    time--;
  };
  //Set time to 5 minutes
  let time = 300;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};
///////////////////////////////////////
// Event handlers
let currentAccount, timer;

//FAKE LOGIN
/*
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;
*/
//Experimenting API
const locale = navigator.language;
console.log(locale);
const now = new Date();
labelDate.textContent = new Intl.DateTimeFormat('en-UK').format(now);
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    //Create Current Date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    /*
    const day = `${now.getDate()}`.padStart(2, 0);
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const year = now.getFullYear();
    const hour = `${now.getHours()}`.padStart(2, 0);
    const min = `${now.getMinutes()}`.padStart(2, 0);
    */
    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Adding the transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    //Reset the Timer
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);
      //Add Loan Date
      currentAccount.movementsDates.push(new Date());
      // Update UI
      updateUI(currentAccount);
    }, 2500);
  }
  inputLoanAmount.value = '';
  //Reset the Timer
  clearInterval(timer);
  timer = startLogoutTimer();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
console.log(23 === 23.0);
console.log(0.1 + 0.2 === 0.3);

console.log(+'23');

//Parsing
console.log(Number.parseInt('30px', 10));
console.log(Number.parseFloat('2.5rem'));

console.log(Number.isNaN('20'));
*/
/*
console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));

console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

console.log(Math.max(5, 4, 23, 11, 43, 8));
console.log(Math.max(5, 18, '23', 11, 2));
console.log(Math.max(5, 18, '23px', 11, 2));

console.log(Math.trunc(Math.PI * Number.parseFloat('10px') ** 2));

console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) => Math.trunc(Math.random() * (max - min)) + min;
// 0...1 -> 0...(max-min) ->
console.log(randomInt(20, 25));

console.log(Math.trunc(23.3));
console.log(Math.round(23.8));
console.log(Math.floor(23.3));
console.log(Math.floor(23.9));

console.log(Math.floor(-23.4));

//Rounding decimals

console.log((2.7).toFixed(0));
console.log(+(2.345).toFixed(2));
*/

//console.log(5 % 2);
/*
const diameter = 287_476_000_000;
console.log(diameter);
*/
/*
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53);

console.log(4975520383244349834934033n);
console.log(BigInt(34789579824384));
*/
//Create a date
/*
const now = new Date();
console.log(now);
console.log(new Date('june 01 2023 11:03:22'));
console.log(new Date('june 15 2023'));
console.log(new Date(2023, 2, 25, 19, 30, 25));
console.log(new Date(0));


const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getDay());
console.log(future.getDate());
console.log(future.toDateString());
console.log(future.toISOString());



const future = new Date(2037, 10, 19, 15, 23);
console.log(+future);

const calcdaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 3600 * 24);

const days1 = calcdaysPassed(new Date(2023, 5, 20), new Date(2023, 5, 24));
console.log(days1);
//setTimeout

const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  3000,
  ...ingredients
);
console.log('Waiting....');

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);
*/

// setInterval
/*
setInterval(function () {
  const now = new Date();
  console.log(now);
}, 3000);
*/
