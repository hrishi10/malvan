const API_URL = "https://script.google.com/macros/s/AKfycbyMtQ35NGiEoi5jjYqCsUEMNUbadjEBa0277uQGjjhM3fjgYuJNAbV8lVibxcsY3-3kvA/exec";

async function loadUsers() {
  try {
    let response = await fetch(API_URL + "?action=getUsers");
    let users = await response.json();
    let select = document.getElementById("paidBy");

    users.forEach(u => {
      let option = document.createElement("option");
      option.value = u.id;
      option.textContent = u.name;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading users", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("expenseForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await addExpense();
    });
  }
});

async function addExpense() {
  let data = {
    action: "addExpense",
    group: "Default Group",
    description: document.getElementById("desc").value,
    amount: parseFloat(document.getElementById("amt").value),
    paidBy: document.getElementById("paidBy").value,
    participants: document.getElementById("participants").value.split(",").map(s => s.trim())
  };

  try {
    let response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    });

    let result = await response.json();
    document.getElementById("message").innerText =
      "✅ Expense added (ID: " + result.id + ")";
  } catch (err) {
    document.getElementById("message").innerText = "❌ Error: " + err;
  }
}

async function loadDashboard() {
  try {
    let response = await fetch(API_URL + "?action=getDashboard");
    let dashboard = await response.json();

    document.getElementById("total").innerText =
      "Total Spend: ₹" + dashboard.totalSpend;

    // Balances
    let balancesList = document.getElementById("balances");
    balancesList.innerHTML = "";
    for (let person in dashboard.balances) {
      let li = document.createElement("li");
      let val = dashboard.balances[person];
      li.innerText =
        person + (val >= 0 ? " should get back " : " owes ") + "₹" + Math.abs(val);
      balancesList.appendChild(li);
    }

    // Settlement
    let settleList = document.getElementById("settlement");
    settleList.innerHTML = "";
    dashboard.settlement.forEach(tx => {
      let li = document.createElement("li");
      li.innerText = tx.from + " → " + tx.to + ": ₹" + tx.amount;
      settleList.appendChild(li);
    });
  } catch (err) {
    document.getElementById("total").innerText =
      "❌ Error loading dashboard";
  }
}
