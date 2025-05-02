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
    viewImg();
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
    document.querySelector(".close").addEventListener("click",()=>{
        exForm.style.display="none";
    });
    addBtn.addEventListener("click",()=>{
        exForm.style.display="none";
    })
}
function popMssg(text){
    const mssg=document.createElement("div");
    mssg.classList.add("success-popup");
    mssg.innerText=text;
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
        popMssg(`Rs.${expense.amount} - ${expense.tag} added!`);
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
    const pastExpByMonth = {};
    const currExpenses =[];

    expenses.forEach(expense => {
        const date = new Date(expense.date);
        const month = date.getMonth();
        const monthKey = date.toLocaleString("default",{month:'short',year:'numeric'});
        if(month===curr){
            currExpenses.push(expense);
        }else{ //month key is like 'Apr 2025' 
            if(!pastExpByMonth[monthKey]){
                pastExpByMonth[monthKey]=[];
            }
            pastExpByMonth[monthKey].push(expense);
        }
    });

    currList.innerHTML='';
    currExpenses.forEach((expense,index)=>{
        let li=document.createElement("div");
        li.classList.add("exDiv");
        li.innerHTML=`<p> Rs.${expense.amount}</p> 
        <p id="date">${formatDate(expense.date)}</p>
        <span id="t">${expense.tag}</span>
         ${expense.img ? `<img src="${expense.img}" class="bill-img">`:''}
         <button id="menu">&#x22EE;</button>
         <div class="dd hidden">
         <button onclick="edit('expenses',${index})">Edit</button>
         <button onclick="deleteExpense(${index})">Delete</button>
         <button onclick="addPic(${index})">Add Bill</button>
         </div>`;
        currList.appendChild(li);
    });
    past.innerHTML='';
    for(let month in pastExpByMonth){
        let monthDiv=document.createElement("div");
        monthDiv.classList.add("pastDiv");

        const total=pastExpByMonth[month].reduce((sum,exp)=>
            sum+ parseFloat(exp.amount),0
        );
        let liHeader=document.createElement("div");
        liHeader.classList.add("pDiv-header");
        liHeader.textContent=`${month} Total: Rs.${total.toFixed(2)}`;
        monthDiv.appendChild(liHeader);

        let monthContent=document.createElement("div");
        monthContent.classList.add("pDiv-content","hidden");

        pastExpByMonth[month].forEach((expense,index)=>{
            let li=document.createElement("div");
            li.classList.add("exDiv");
            li.innerHTML=`<p> Rs.${expense.amount}</p> 
            <p id="date">${formatDate(expense.date)}</p>
            <span id="t">${expense.tag}</span>
             ${expense.img ? `<img src="${expense.img}" class="bill-img">`:''}
             <button id="menu">&#x22EE;</button>
             <div class="dd hidden">
             <button onclick="edit('expenses',${index})">Edit</button>
             <button onclick="deleteExpense(${index})">Delete</button>
             <button onclick="addPic(${index})">Add Bill</button>
             </div>`;
             monthContent.appendChild(li);
        });
        monthDiv.appendChild(monthContent)
        past.appendChild(monthDiv);

        liHeader.addEventListener("click",()=>{
            monthContent.classList.toggle("hidden");
        });
    }
    document.querySelectorAll("#menu").forEach(btn => {
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
function togglePast(){
    let past=document.querySelector(".past");
    const arrow=document.querySelector(".arrow-caret");
    let header=document.querySelector(".p-header");
    header.classList.toggle("raised");
    past.classList.toggle("open");
    arrow.classList.toggle("rotated");
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
         <button id="menu">&#x22EE;</button>
         <div class="dd hidden">
         <button onclick="edit('incomes',${index})">Edit</button>
         <button onclick="deleteInc(${index})">Delete</button>
         </div>`;
        incList.appendChild(li);
    });
    document.querySelectorAll("#menu").forEach(btn => {
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
function addPic(index){
let input=document.createElement("input");
input.type="file";
input.accept="image/*";
input.capture="environment";
    input.onchange=()=>{
        const file=input.files[0];
    
        if(file){
            const reader=new FileReader();
            reader.onload=(e)=>{
                const expenses=JSON.parse(localStorage.getItem("expenses"))||[];
                expenses[index].img=e.target.result;
                localStorage.setItem("expenses",JSON.stringify(expenses));
                displayExpense();
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}
function viewImg(){
    const fullImageView = document.getElementById("fullImageView");
    const fullImg = document.getElementById("fullImg");

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("bill-img")) {
            fullImg.src = e.target.src;
            fullImageView.style.display = "flex";
            history.pushState({ imgOpen: true }, ""); // push state so back button works
        }
    });
    fullImageView.addEventListener("click", () => {
        fullImageView.style.display = "none";
        history.back(); // simulates pressing back
    });

    window.addEventListener("popstate", () => {
        fullImageView.style.display = "none";
    });
}
function delImg(){
    const imgSrc=fullImg.src;
    let expenses=JSON.parse(localStorage.getItem("expenses"))||[];
    const index=expenses.findIndex(exp=>exp.img===imgSrc);
    if(index===-1)return;
    const backupImg=expenses[index].img;
    expenses[index].img=null;
    localStorage.setItem("expenses",JSON.stringify(expenses));
    displayExpense();

    fullImageView.style.display="none";

    const undo=document.createElement("div");
    undo.classList.add("success-popup");
    undo.style.opacity="0.8";
    undo.innerText="undo image?";
    document.body.appendChild(undo);

    setTimeout(()=>{
        undo.remove();
    },10000);

    undo.addEventListener("click",()=>{
        let imgUndone=JSON.parse(localStorage.getItem("expenses"))||[];
        if(imgUndone[index]){
            imgUndone[index].img=backupImg;
            localStorage.setItem("expenses",JSON.stringify(imgUndone));
            displayExpense();
        }
        undo.style.display="none";
    })
}
function openSetModal(){
    document.getElementById("set-modal").style.display="block";
    document.getElementById("mode").checked=document.body.classList.contains("dark");
}
function closeModal(){
    document.getElementById("set-modal").style.display="none";
}
function toggleMode(){
    document.body.classList.toggle("dark");
    const theme=document.body.classList.contains("dark")?"dark":"light";
    localStorage.setItem("theme",theme);
}
window.addEventListener("DOMContentLoaded",()=>{
    if(localStorage.getItem("theme")==="dark"){
        document.body.classList.add("dark");
    }
});

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



