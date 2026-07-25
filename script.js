// Select HTML elements
const form = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");

const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const monthIncome = document.getElementById("month-income");
const monthExpense = document.getElementById("month-expense");
const monthSavings = document.getElementById("month-savings");
const downloadCSV = document.getElementById("download-csv");
const transactionList = document.getElementById("transaction-list");
const searchInput = document.getElementById("search");
const filterType = document.getElementById("filter-type");
const filterCategory = document.getElementById("filter-category");
const sortTransactions = document.getElementById("sort-transactions");
const themeToggle = document.getElementById("theme-toggle");

// Variables
let balanceAmount = 0;
let incomeAmount = 0;
let expenseAmount = 0;

let transactions = []; //transactions array
let expenseChart = null;

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateUI() {

    if(balance){
        balance.textContent = `₹${balanceAmount.toLocaleString("en-IN")}`;
    }

    if(income){
        income.textContent = `₹${incomeAmount.toLocaleString("en-IN")}`;
    }

    if(expense){
        expense.textContent = `₹${expenseAmount.toLocaleString("en-IN")}`;
    }

}
function updateMonthlyStats() {

    let currentMonthIncome = 0;
    let currentMonthExpense = 0;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    transactions.forEach(function(transaction) {

        const transactionDate = new Date(transaction.id);

        const transactionMonth = transactionDate.getMonth();
        const transactionYear = transactionDate.getFullYear();

        if (
            transactionMonth === currentMonth &&
            transactionYear === currentYear
        ) {

            if (transaction.type === "Income") {
                currentMonthIncome += transaction.amount;
            } else {
                currentMonthExpense += transaction.amount;
            }

        }

    });

   if(monthIncome){
    monthIncome.textContent = `₹${currentMonthIncome.toLocaleString("en-IN")}`;
}

if(monthExpense){
    monthExpense.textContent = `₹${currentMonthExpense.toLocaleString("en-IN")}`;
}

if(monthSavings){
    monthSavings.textContent = `₹${(currentMonthIncome-currentMonthExpense).toLocaleString("en-IN")}`;
}
}
function updateChart() {
    const ctx = document.getElementById("expenseChart");

if(!ctx){
    return;
}

    const categoryTotals = {};

    transactions.forEach(function(transaction) {

        if (transaction.type === "Expense") {

            if (categoryTotals[transaction.category]) {
                categoryTotals[transaction.category] += transaction.amount;
            } else {
                categoryTotals[transaction.category] = transaction.amount;
            }

        }

    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    if (expenseChart) {
    expenseChart.destroy();
}
    expenseChart = new Chart(ctx, {

    type: "pie",

    data: {

        labels: labels,

        datasets: [{

            data: data,

            backgroundColor: [
                "#4CAF50",
                "#2196F3",
                "#FF9800",
                "#F44336",
                "#9C27B0"
            ]

        }]

    },

    options: {

        responsive: true,

        plugins: {

            legend: {
                position: "bottom"
            }

        }

    }

});
}

function addTransactionToUI(transaction) {
    const li = document.createElement("li");
li.classList.add("transaction-item");

if (transaction.type === "Income") {
    li.classList.add("income");
} else {
    li.classList.add("expense");
}

li.innerHTML = `
    <div>
    <strong>${transaction.title}</strong><br>
    <small>Category: ${transaction.category}</small><br>
    <small>${transaction.date}</small>
    </div>

    <span>₹${transaction.amount.toLocaleString("en-IN")}</span>

    <button class="delete-btn">❌</button>
`;

transactionList.appendChild(li);
const deleteBtn = li.querySelector(".delete-btn");

deleteBtn.addEventListener("click", function () {
    const confirmDelete = confirm("Are you sure you want to delete this transaction?");

if (!confirmDelete) {
    return;
}

    if (transaction.type === "Income") {
        incomeAmount -= transaction.amount;
        balanceAmount -= transaction.amount;
    } else {
        expenseAmount -= transaction.amount;
        balanceAmount += transaction.amount;
    }

    transactions = transactions.filter(function(item) {
    return item.id !== transaction.id;
});

    saveTransactions();
    updateUI();
    displayTransactions(transactions);
    updateChart();
    updateMonthlyStats();
});


}

function displayTransactions(list) {
    if(!transactionList){
    return;
}
    transactionList.innerHTML = "";

    if (list.length === 0) {

        transactionList.innerHTML =
            "<p class='empty-message'>No transactions found.</p>";

        return;
    }

    list.forEach(function(transaction) {
        addTransactionToUI(transaction);
    });

}
function loadTransactions() {
  const storedTransactions = localStorage.getItem("transactions");

  if (storedTransactions) {
    transactions = JSON.parse(storedTransactions);
    console.log("Transactions:", transactions);
    transactions.forEach(function (transaction) {


    if (transaction.type === "Income") {
        incomeAmount += transaction.amount;
        balanceAmount += transaction.amount;
    } else {
        expenseAmount += transaction.amount;
        balanceAmount -= transaction.amount;
    }

});
   updateUI();
    displayTransactions(transactions);
    updateChart();
    updateMonthlyStats();
    
  }
}
loadTransactions();
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
}
if(form){
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = titleInput.value;
  const amount = Number(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value;
  if (title.trim() === "" || amount <= 0) {
    alert("Please enter valid details.");
    return;
}
const transaction = {
    id: Date.now(),
    title,
    amount,
    type,
    category,
    date: new Date().toLocaleDateString("en-IN")
};

transactions.push(transaction);

if (type === "Income") {
    incomeAmount += amount;
    balanceAmount += amount;
} else {
    expenseAmount += amount;
    balanceAmount -= amount;
}

saveTransactions();
updateUI();
displayTransactions(transactions);
updateMonthlyStats();
updateChart();

form.reset();

  


});
}

if(searchInput){
searchInput.addEventListener("input", function () {

    const searchText = searchInput.value.toLowerCase();

    console.log(searchText);

    const filteredTransactions = transactions.filter(function (transaction) {
        return transaction.title.toLowerCase().includes(searchText);
    });

    console.log(filteredTransactions);

    displayTransactions(filteredTransactions);

});
}

if(filterType){
filterType.addEventListener("change", function () {

    const selectedType = filterType.value;

    const filteredTransactions = transactions.filter(function (transaction) {

        if (selectedType === "All") {
            return true;
        }

        return transaction.type === selectedType;

    });

    displayTransactions(filteredTransactions);

});
}
  
if(filterCategory){
filterCategory.addEventListener("change", function () {

    const selectedCategory = filterCategory.value;

    const filteredTransactions = transactions.filter(function (transaction) {

        if (selectedCategory === "All") {
            return true;
        }

        return transaction.category === selectedCategory;

    });

    displayTransactions(filteredTransactions);

});
}

if(sortTransactions){
sortTransactions.addEventListener("change", function () {

    const sortValue = sortTransactions.value;

    let sortedTransactions = [...transactions];

    if (sortValue === "low") {

        sortedTransactions.sort(function(a, b) {
            return a.amount - b.amount;
        });

    }
    if (sortValue === "high") {

    sortedTransactions.sort(function(a, b) {
        return b.amount - a.amount;
    });

    }
    if (sortValue === "newest") {

    sortedTransactions.sort(function(a, b) {
        return b.id - a.id;
    });

    }
    if (sortValue === "oldest") {

    sortedTransactions.sort(function(a, b) {
        return a.id - b.id;
    });

    }

    displayTransactions(sortedTransactions);

});
}

if(downloadCSV){
downloadCSV.addEventListener("click", function () {

    let csv = "Title,Category,Type,Amount,Date\n";

    transactions.forEach(function(transaction) {

        csv += `${transaction.title},${transaction.category},${transaction.type},${transaction.amount},${transaction.date}\n`;

    });

    const blob = new Blob([csv], { type: "text/csv" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();

    URL.revokeObjectURL(url);

});
}
themeToggle.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        localStorage.setItem("theme", "dark");

    } else {

        localStorage.setItem("theme", "light");

    }

});