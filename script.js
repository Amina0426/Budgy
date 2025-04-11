const nav=document.querySelectorAll("a");
const box=document.querySelector(".container");
const sections=document.querySelectorAll("#h,#e,#i");
let input=document.querySelector("#in");
let tags=document.querySelectorAll(".tagel");  //nodelist
let addTag=document.querySelector("#tag2");
let addBtn=document.querySelector("#add");
let exForm=document.querySelector("#overlay1");
let display=document.querySelector(".display");

let selectedTag="";

function initiaLoad(){
    navigation();
    scrollTrack();
    AbouTags();
    home();
    addExpenses();
    displayExpense();
    addIncome();
    displayIncome();
    track();
}
window.addEventListener("load",initiaLoad);
document.addEventListener("click", closeAllDropdowns);
function closeAllDropdowns() {
  document.querySelectorAll(".dd").forEach(menu => {
    menu.classList.add("hidden");
  });
}

function navigation(){
    nav.forEach(link => {
        if (link.getAttribute("href") === "#h") {
            link.classList.add("active");
        }

        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href").substring(1);
            document.getElementById(targetId).scrollIntoView({ 
                behavior: "smooth", inline: "start" 
            });
            nav.forEach(l => 
            l.classList.remove("active"));
            link.classList.add("active");
        });
    });
}
function scrollTrack(){
    box.addEventListener("scroll",()=>{
        let curr='';
        sections.forEach((sec)=>{
            if(box.scrollLeft>=sec.offsetLeft-100){
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
}
function AbouTags(){
    ["click", "touchend"].forEach(e=>{
    tags.forEach(tag=>{
        tag.addEventListener(e,()=>{
            selectedTag=tag.textContent;
            tags.forEach(btn=>btn.classList.remove("selected"));
            tag.classList.add("selected");
        });
    });
    });
    
    let input=document.querySelector("#tagInput");

    addTag.addEventListener("click",()=>{
        input.style.visibility="visible";
        input.focus();
    });
}
function home(){
    let homeBtn=document.querySelector(".add");
    homeBtn.addEventListener("click",()=>{
        exForm.style.display="block";
    });
    document.querySelector("#close").addEventListener("click",()=>{
        exForm.style.display="none";
        popMssg();
    });
    addBtn.addEventListener("click",()=>{
        exForm.style.display="none";
        popMssg();
    })
}
function popMssg(){
    const mssg=document.createElement("div");
    mssg.classList.add("success-popup");
    mssg.innerText="Expense Page Closed Successfully!";
    document.body.appendChild(mssg);

    setTimeout(()=>{
        mssg.remove();
    },2000);
}
function addExpenses(){
    addBtn.addEventListener("click",()=>{ 
        const amount=input.value;
        let tagIn=document.querySelector("#tagInput");
        if(tagIn.style.visibility==="visible" && tagIn.value.trim()!==""){
            selectedTag=tagIn.value.trim();
            tagIn.style.visibility="hidden";
            tagIn.value="";
        }
        if(amount<=0||!selectedTag){
            alert("Enter a valid amount and select a tag!");
            return;
        }
        const expense={  //creating object
            amount:amount,
            tag:selectedTag,
            date:new Date().toISOString()
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
        track();
        document.querySelector("#tagInput").style.visibility="hidden";
    });    
}
function displayExpense(){
    const currList = document.querySelector(".curr");
    const past = document.querySelector(".past");
    if(!currList||!past)return;

    let expenses= JSON.parse(localStorage.getItem("expenses"))||[];

    const curr = new Date().getMonth();
    const monthTotals = {};
    const currExpenses =[];

    expenses.forEach(expense => {
        const date = new Date(expense.date);
        const month = date.getMonth();
        if(month===curr){
            currExpenses.push(expense);
        }else{ //month key is like 'Apr 2025' 
            const monthKey = date.toLocaleString("default",{month:'short',year:'numeric'});
            monthTotals[monthKey]=(monthTotals[monthKey]||0)+expense.amount;
        }
    });

    currList.innerHTML='';
    currExpenses.forEach((expense,index)=>{
        let li=document.createElement("div");
        li.classList.add("exDiv");
        li.innerHTML=`<p> Rs.${expense.amount}</p> 
        <p id="date">${formatDate(expense.date)}</p>
         <p id="t">(${expense.tag})</p>
         <div class="menu">&#x22EE;</div>
         <div class="dd hidden">
         <button onclick="edit('expenses',${index})">Edit</button>
         <button onclick="deleteExpense(${index})">Delete</button>
         </div>`;
        currList.appendChild(li);
    });
    past.innerHTML='';
    for(let month in monthTotals){
        let li=document.createElement("div");
        li.textContent=`${month} Total: Rs.${monthTotals[month]}`;
        past.appendChild(li);
    }
    document.querySelectorAll(".menu").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          closeAllDropdowns();
          const dropdown = btn.nextElementSibling;
          dropdown.classList.toggle("hidden");
        });
      });
}
function formatDate(iso){
    const d=new Date(iso);
    const day=String(d.getDate()).padStart(2,'0');
    const month=String(d.getMonth()+1).padStart(2,'0');
    const year=d.getFullYear();
    return `${day}/${month}/${year}`;
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
window.addEventListener("storage",(e)=>{
    if(e.key === "expenses"){
        displayExpense();
    }
});
function addIncome(){
    let incIn=document.querySelector("#income");
    let incAdd=document.querySelector("#inBtn");

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
        track();
    });

}
function displayIncome(){
    let incList=document.querySelector(".incList");
    let incomes=JSON.parse(localStorage.getItem("incomes"))||[];
    incList.innerHTML='';

    incomes.forEach((income,index)=>{
        let li=document.createElement("div");
        li.classList.add("inDiv");
        li.innerHTML=`<p>Rs. ${income.amount}</p> 
        <p id="date">${income.date}</p>  
         <div class="menu">&#x22EE;</div>
         <div class="dd hidden">
         <button onclick="edit('incomes',${index})">Edit</button>
         <button onclick="deleteInc(${index})">Delete</button>
         </div>`;
        incList.appendChild(li);
    });
    document.querySelectorAll(".menu").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          closeAllDropdowns();
          const dropdown = btn.nextElementSibling;
          dropdown.classList.toggle("hidden");
        });
      });
}
function deleteInc(index){
    let incomes=JSON.parse(localStorage.getItem("incomes"))||[];
    incomes.splice(index,1);
    localStorage.setItem("incomes",JSON.stringify(incomes));
    displayIncome();
}
function track(){
    let exp=JSON.parse(localStorage.getItem("expenses"))||[];
    let inc=JSON.parse(localStorage.getItem("incomes"))||[];

    let totalInc=inc.reduce((sum,i)=>sum+Number(i.amount),0);
    let totalExp=exp.reduce((sum,e)=>sum+Number(e.amount),0);
    let balance=totalInc-totalExp;
    
    document.getElementById("inMon").innerText=totalInc;
    document.getElementById("exMon").innerText=totalExp;
    document.querySelector(".balance").innerText=
    ` Balance : ${balance}`;

    const exPercent=(totalExp/totalInc)*100;
    document.querySelector(".ex-bar").style.width=`${exPercent}%`;
}
function edit(type,index){
    let data;
    try{
    data = JSON.parse(localStorage.getItem(type==='expenses'?'expenses':'incomes'))||[];
    if(!Array.isArray(data)) throw new Error();
    }catch{
        data=[];
    }

    const item=data[index];
    if(!item){
        return;
    }
    const newAmt=prompt("Enter new amount:",item.amount);
    if(newAmt===null||isNaN(Number(newAmt))||newAmt.trim()==="")return;

    data[index].amount=Number(newAmt);

    if(type==='expenses'){
        let newTag=prompt("Enter new tag",item.tag);
        if(newTag===null||newTag.trim()==="")return;
        data[index].tag=newTag.trim();
    }
    localStorage.setItem(type==='expenses'?'expenses':'incomes',JSON.stringify(data));
    if(type==='expenses'){
        displayExpense();
    }else{
        displayIncome();
    }
}

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



