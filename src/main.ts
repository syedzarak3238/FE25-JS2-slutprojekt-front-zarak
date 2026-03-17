const API = "http://localhost:3000";

interface Assignment {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "new" | "doing" | "done";
  assignedTo: string | null;
  timestamp: number;
}

interface Member {
  id: string;
  name: string;
  category: string;
}

let members: Member[] = [];
let assignments: Assignment[] = [];

document.addEventListener("DOMContentLoaded", () => {
  loadData();

  // ADD MEMBER
  const addMemberBtn = document.getElementById("addMemberBtn")!;
  addMemberBtn.addEventListener("click", async () => {
    const name = (document.getElementById("memberName") as HTMLInputElement).value;
    const category = (document.getElementById("memberCategory") as HTMLSelectElement).value;

    if (!name) return alert("Enter name");

   await fetch(`${API}/members`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, category }),
});
// Clear inputs
(document.getElementById("memberName") as HTMLInputElement).value = "";
(document.getElementById("memberCategory") as HTMLSelectElement).selectedIndex = 0;

alert("New member has been added successfully ✅");

loadData();
  });

  // ADD TASK
  const addTaskBtn = document.getElementById("addTaskBtn")!;
  addTaskBtn.addEventListener("click", async () => {
    const title = (document.getElementById("taskTitle") as HTMLInputElement).value;
    const description = (document.getElementById("taskDescription") as HTMLInputElement).value;
    const category = (document.getElementById("taskCategory") as HTMLSelectElement).value;

    if (!title || !description) return alert("Fill all fields");

    await fetch(`${API}/assignments`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title, description, category }),
});

// Clear inputs
(document.getElementById("taskTitle") as HTMLInputElement).value = "";
(document.getElementById("taskDescription") as HTMLInputElement).value = "";
(document.getElementById("taskCategory") as HTMLSelectElement).selectedIndex = 0;

alert("New task has been added successfully ✅");

loadData();
  });
});

async function loadData() {
  const res = await fetch(`${API}/data`);
  const data = await res.json();

  members = data.members;
  assignments = data.assignments;

  render();
}

function render() {
  const newDiv = document.getElementById("new")!;
  const doingDiv = document.getElementById("doing")!;
  const doneDiv = document.getElementById("done")!;

  newDiv.innerHTML = "";
  doingDiv.innerHTML = "";
  doneDiv.innerHTML = "";

  assignments.forEach(task => {
    const card = document.createElement("div");
    card.style.border = "3px solid black";
    card.style.margin = "5px";
    card.style.padding = "5px";

    const formattedDate = new Date(task.timestamp).toLocaleString(); // Convert timestamp to human-readable format

card.innerHTML = `
  <h4>${task.title}</h4>
  <p>${task.description}</p>
  <p><strong>Category:</strong> ${task.category}</p>
  <p><strong>Assigned To:</strong> ${task.assignedTo ?? "-"}</p>
  <p><strong>Last Updated:</strong> ${formattedDate}</p> 
`;

    if (task.status === "new") {
      const select = document.createElement("select");

      const defaultOption = document.createElement("option");
      defaultOption.textContent = "Assign to...";
      defaultOption.disabled = true;
      defaultOption.selected = true;
      select.appendChild(defaultOption);

      members
        .filter(m => m.category === task.category)
        .forEach(member => {
          const option = document.createElement("option");
          option.value = member.name;
          option.textContent = member.name;
          select.appendChild(option);
        });

      select.addEventListener("change", async () => {
        await fetch(`${API}/assignments/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignedTo: select.value,
            status: "doing"
          }),
        });

        loadData();
      });

      card.appendChild(select);
      newDiv.appendChild(card);
    }

    if (task.status === "doing") {
      const btn = document.createElement("button");
      btn.textContent = "Mark Done";
      btn.onclick = async () => {
        await fetch(`${API}/assignments/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "done" }),
        });
        loadData();
      };

      card.appendChild(btn);
      doingDiv.appendChild(card);
    }

    if (task.status === "done") {
      const btn = document.createElement("button");
      btn.textContent = "Delete";
      btn.onclick = async () => {
        await fetch(`${API}/assignments/${task.id}`, {
          method: "DELETE",
        });
        loadData();
      };

      card.appendChild(btn);
      doneDiv.appendChild(card);
    }
  });
}