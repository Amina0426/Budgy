const nav=document.querySelectorAll("a"); //nodelist
let input=document.querySelector("#in");
let tags=document.querySelectorAll(".tagel");  //nodelist
let addTag=document.querySelector("#tag2");
let addBtn=document.querySelector("#add");


let selectedTag="";

tags.forEach(tag=>{
    tag.addEventListener("click",()=>{
        console.log("clicked");
        selectedTag=tag.textContent;
        tags.forEach(btn=>btn.classList.remove("selected"));
        tag.classList.add("selected");
    });
});

addBtn.addEventListener("click",()=>{      //adds inputted expense to local storage
    const amount=input.value;
    if(amount<=0||!selectedTag){
        alert("Enter a valid amount and select a tag!");
        return;
    }

    const expense={  //creating object
        amount:amount,
        tag:selectedTag,
        date:new Date().toLocaleDateString()
    };

    //saving to localStorage
    let expenses= JSON.parse(localStorage.getItem("expenses"))||[];
    expenses.push(expense);
    localStorage.setItem("expenses",JSON.stringify(expenses));

    input.value="";
    tags.forEach(tag=>{
        tag.classList.remove("selected");
    });
    displayExpense();
});

function displayExpense(){
    const currList = document.querySelector(".curr");
    const past = document.querySelector(".past");
    if(!currList||!past)return;

    let expenses= JSON.parse(localStorage.getItem("expenses"))||[];

    const curr = new Date().getMonth();
    const monthTotals = {};
    const currExpenses =[];

    expenses.forEach(expense => {
        console.log(expense);
        const date = new Date(expense.date);
        const month = date.getMonth();

        if(month===curr){
            currExpenses.push(expense);
        }else{ //month key is like 'Apr 2025' 
            const monthKey = date.toLocaleString(`default`,{month:'short',year:'numeric'});
            monthTotals[monthKey]=(monthTotals[monthKey]||0)+expense.amount;
        }
    });

    currList.innerHTML='';
    currExpenses.forEach((expense,index)=>{
        let li=document.createElement("div");
        li.classList.add("exDiv");
        li.innerHTML=`<p>${expense.date} : Rs.${expense.amount}</p>  <p>(${expense.tag})
        </p><button onclick="deleteExpense(${index})">Delete</button>`;
        currList.appendChild(li);
    });
    past.innerHTML='';
    for(let month in monthTotals){
        let li=document.createElement("div");
        li.textContent=`${month} Total: Rs.${monthTotals[month]}`;
        past.appendChild(li);
    }
}

function deleteExpense(index){
    let expenses=JSON.parse(localStorage.getItem("expenses"))||[];
    const curr=new Date().getMonth();

    let currExpenses=expenses.filter(exp=> new Date(exp.date).getMonth()===curr);
    
    if(index>=0 && index<currExpenses.length){
        const expToDel=currExpenses[index];
        expenses=expenses.filter(exp=> !(exp.date === expToDel.date && exp.amount===
            expToDel.amount && exp.tag === expToDel.tag));
    }
    
    localStorage.setItem("expenses",JSON.stringify(expenses));
    displayExpense();
}
displayExpense();
window.addEventListener("storage",(e)=>{
    if(e.key === "expenses"){
        displayExpense();
    }
});

//income section
let incIn=document.querySelector("#income");
let incAdd=document.querySelector("#inBtn");
let incList=document.querySelector(".incList");

incAdd.addEventListener("click",()=>{
    let amt=incIn.value;
    if(amt<=0){
        alert("enter valid amount");
        return;
    }

    let income={
        amount:amt,
        date:new Date().toLocaleDateString()
    };

    let incomes=JSON.parse(localStorage.getItem("incomes"))||[];
    incomes.push(income);
    localStorage.setItem("incomes",JSON.stringify(incomes));

    incIn.value="";
    displayIncome();
});

function displayIncome(){
    let incomes=JSON.parse(localStorage.getItem("incomes"))||[];
    incList.innerHTML='';

    incomes.forEach((income,index)=>{
        let li=document.createElement("div");
        li.classList.add("inDiv");
        li.innerHTML=`<p>Rs. ${income.amount}</p> <p id="date">${income.date}</p>  
        <button onclick="deleteInc(${index})">Delete</button>`;
        incList.appendChild(li);
    });
}

function deleteInc(index){
    let incomes=JSON.parse(localStorage.getItem("incomes"))||[];
    incomes.splice(index,1);
    localStorage.setItem("incomes",JSON.stringify(incomes));
    displayIncome();
}
displayIncome();

if ("serviceWorker" in navigator) {
    window.addEventListener("load",()=>{
        navigator.serviceWorker.register("/Budgy/service-worker.js",{scope:'/Budgy/'})
        .then(reg => {
            console.log("Service Worker Registered:",reg);
        })
        .catch(err => {
            console.error("Service worker failed:",err);
        });
    });  
}