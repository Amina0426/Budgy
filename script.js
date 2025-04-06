const nav=document.querySelectorAll("a"); //nodelist
const sections=document.querySelectorAll("#h,#e,#i"); //nodelist
let box=document.querySelector(".container");
let input=document.querySelector("#in");
let tags=document.querySelectorAll(".tagel");  //nodelist
let addTag=document.querySelector("#tag2");
let addBtn=document.querySelector("#add");


let selectedTag="";
["click", "touchend"].forEach(e=>{
tags.forEach(tag=>{
    tag.addEventListener(e,()=>{
        console.log("clicked");
        selectedTag=tag.textContent;
        tags.forEach(btn=>btn.classList.remove("selected"));
        tag.classList.add("selected");
    });
});
});

window.addEventListener("load",()=>{
    nav.forEach((link)=>{
        if(link.getAttribute("href")==="#h"){
            link.classList.add("active");
        }
    });
});
nav.forEach((link)=>{
    link.addEventListener("click",(e)=>{
        e.preventDefault();
        const targetId=link.getAttribute("href").substring(1);
        const targetSec=document.getElementById(targetId);
        if(targetSec){
            targetSec.scrollIntoView({
                behavior:"smooth",inline:"start"
            });
        }
        nav.forEach((l)=>{
            l.classList.remove("active");
            link.classList.add("active");
        });
    });
})
box.addEventListener("scroll",()=>{
    let curr="";
    sections.forEach((sec)=>{
        const secLeft=sec.offsetLeft;
        if(box.scrollLeft>=secLeft-100){
            curr=sec.getAttribute("id");
        }
    });
    nav.forEach((link)=>{
        link.classList.remove("active");
        if(link.getAttribute("href").includes(curr)){
            link.classList.add("active");
        }
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
    document.getElementById("dbg").textContent+="\n\n All expenses: "+JSON.stringify(expenses,null,2);

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
    document.getElementById("dbg").textContent="curr Expenses: "+JSON.stringify(currExpenses,null,2);
    currExpenses.forEach((expense,index)=>{
        let li=document.createElement("div");
        li.classList.add("exDiv");
        li.innerHTML=`<p> Rs.${expense.amount}</p> <p id="date">${expense.date}</p> <p id="t">(${expense.tag})
        </p><button onclick="deleteExpense(${index})">&#x1F5D1;</button>`;
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
        <button onclick="deleteInc(${index})">&#x1F5D1;</button>`;
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
        navigator.serviceWorker.register("service-worker.js")
        .then(reg => {
            console.log("Service Worker Registered:",reg);
        })
        .catch(err => {
            console.error("Service worker failed:",err);
        });
    });  
}
