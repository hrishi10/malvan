const API_URL = "https://script.google.com/macros/s/AKfycbyMtQ35NGiEoi5jjYqCsUEMNUbadjEBa0277uQGjjhM3fjgYuJNAbV8lVibxcsY3-3kvA/exec";

async function loadUsers() {
  try {
    let response = await fetch(API_URL + "?action=getUsers");
    let users = await response.json();

    // Paid By dropdown
    let paidBySelect = document.getElementById("paidBy");
    let participantsDiv = document.getElementById("participants");

    users.forEach(u => {
      // Paid By option
      let option = document.createElement("option");
      option.value = u.id;
      option.textContent = u.name;
      paidBySelect.appendChild(option);

      // Share it with checkboxes
      let label = document.createElement("label");
      label.style.display = "block"; // one per line

      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = u.id;

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(" " + u.name));

      participantsDiv.appendChild(label);
    });
  } catch (err) {
    console.error("Error loading users", err);
  }
}

async function addExpense() {
  console.log("AddExpense triggered");

  let participantChecks = document.querySelectorAll("#participants input[type=checkbox]:checked");
  let selectedParticipants = Array.from(participantChecks).map(c => c.value);

  let data = {
    action: "addExpense",
    group: "Default Group",
    description: document.getElementById("desc").value,
    amount: parseFloat(document.getElementById("amt").value),
    paidBy: document.getElementById("paidBy").value,
    participants: selectedParticipants
  };

  console.log("Data to send:", data);

  try {
    let response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    });

    console.log("Raw response:", response);

    let result = await response.json();
    console.log("Parsed result:", result);

    document.getElementById("message").innerText =
      "✅ Expense added (ID: " + result.id + ")";
  } catch (err) {
    console.error("Error submitting expense:", err);
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
