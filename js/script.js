document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const DEFAULT_DATA = {
        personal: {
            name: "Akash Jana",
            title: "IT Executive",
            email: "akashjana171@gmail.com",
            phone: "+91-8609771837",
            location: "Howrah, West Bengal, India",
            linkedin: "https://www.linkedin.com/in/akash-jana-a234b3217/",
            github: "https://github.com/akashjana171",
            profileImage: "images/profile.jpg"
        },
        about: "IT professional with experience in Windows Server Administration, Active Directory, VMware ESXi, Microsoft 365, Networking, Desktop Support, Hardware Troubleshooting, and Enterprise IT Infrastructure.",
        skills: [
            {name:"Windows Server",description:"Active Directory, DNS, DHCP, Group Policy and File Services",icon:"fas fa-server"},
            {name:"Active Directory",description:"Users, groups, permissions, GPO and domain administration",icon:"fas fa-users-gear"},
            {name:"VMware ESXi",description:"Virtual machines, datastores, snapshots and virtualization",icon:"fas fa-cloud"},
            {name:"Networking",description:"TCP/IP, VLAN, VPN, routing, switching and troubleshooting",icon:"fas fa-network-wired"},
            {name:"Linux Administration",description:"Ubuntu Server, SSH, Apache, Docker and services",icon:"fab fa-linux"},
            {name:"AWS Cloud",description:"EC2, IAM, VPC and Security Groups",icon:"fab fa-aws"}
        ],
        experience: [
            {title:"IT Executive",company:"Gypmart India Private Limited",start:"July 2026",end:"Present",responsibilities:["Desktop Support","Network Troubleshooting","Microsoft 365 Support","Hardware and Software Troubleshooting","IT Asset Management"]},
            {title:"System Engineer",company:"Precision Informatics (M) Pvt. Ltd.",start:"July 2025",end:"May 2026",responsibilities:["Windows Server Administration","Active Directory Management","VMware ESXi Administration","Microsoft 365 Support","DNS and DHCP","Enterprise IT Infrastructure Support"]},
            {title:"Facility Management Engineer",company:"Eastern Services",start:"June 2023",end:"July 2025",responsibilities:["Oracle MICROS POS Support","LAN and Network Troubleshooting","Aruba Wireless Support","Hardware Maintenance","Desktop and Printer Support"]},
            {title:"IT Executive",company:"Fusion BPO Services",start:"April 2022",end:"June 2023",responsibilities:["Desktop Support","Operating System Installation","Printer Configuration","Remote User Support","IT Inventory Management"]}
        ],
        projects: [
            {name:"Windows Server & Active Directory",image:"images/active-directory.jpg",description:"Hands-on lab covering Active Directory, DNS, DHCP, Group Policy and user management.",link:""},
            {name:"AWS Cloud Lab",image:"images/aws-cloud.jpg",description:"AWS lab environment using EC2, IAM, VPC and Security Groups.",link:""},
            {name:"Network Infrastructure",image:"images/network-infrastructure.jpg",description:"LAN, VLAN, IP addressing, routing, switching and enterprise network troubleshooting.",link:""},
            {name:"Linux Administration",image:"images/linux-administration.jpg",description:"Ubuntu Server administration with SSH, Apache, Docker and service management.",link:""},
            {name:"Enterprise IT Infrastructure",image:"images/background.jpg",description:"Infrastructure operations covering endpoints, servers, networking, security and support.",link:""},
            {name:"VMware ESXi Lab",image:"images/vmware-esxi.jpg",description:"Virtualization lab using VMware ESXi with virtual machines and datastore administration.",link:""}
        ],
        contact: {
            name:"Akash Jana",
            email:"akashjana171@gmail.com",
            phone:"+91-8609771837",
            location:"Howrah, West Bengal, India"
        },
        whatsapp: ""
    };

    const API = "/api/portfolio";
    const MESSAGE_API = "/api/messages";
    const esc = v => String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");

    async function loadPortfolio() {
        try {
            const r = await fetch(API, {cache:"no-store"});
            const text = await r.text();
            let json = {};
            try { json = text ? JSON.parse(text) : {}; } catch (_) { throw new Error("Portfolio API returned invalid JSON"); }
            if (!r.ok || !json.data) throw new Error(json.error || "Unable to load portfolio");
            render(json.data);
        } catch (e) {
            console.warn("Using built-in portfolio data:", e.message);
            render(DEFAULT_DATA);
        }
    }

    function setText(id, value) {
        const e = document.getElementById(id);
        if (e) e.textContent = value || "";
    }

    function render(data) {
        const p = {...DEFAULT_DATA.personal, ...(data.personal || {})};
        setText("navName", p.name); setText("heroName", p.name); setText("heroTitle", p.title);
        setText("aboutName", p.name); setText("aboutRole", p.title); setText("aboutLocation", p.location); setText("aboutEmail", p.email);
        setText("contactName", p.name); setText("contactPhone", p.phone); setText("contactLocation", p.location);
        setText("footerName", p.name); setText("footerTitle", p.title + " | System Engineer");
        setText("aboutDescription", data.about || DEFAULT_DATA.about);

        const profile = document.getElementById("heroProfile");
        if (profile) { profile.src = p.profileImage || DEFAULT_DATA.personal.profileImage; profile.alt = p.name; }

        const links = {heroLinkedIn:p.linkedin, contactLinkedIn:p.linkedin, heroGitHub:p.github, contactGitHub:p.github};
        Object.entries(links).forEach(([id,url]) => { const e=document.getElementById(id); if(e)e.href=/^https?:\/\//i.test(url||"")?url:"#"; });
        ["heroEmail","contactEmail"].forEach(id => { const e=document.getElementById(id); if(e){e.href=p.email?"mailto:"+p.email:"#"; if(id==="contactEmail")e.textContent=p.email||"";} });

        const skills = Array.isArray(data.skills) && data.skills.length ? data.skills : DEFAULT_DATA.skills;
        const experience = Array.isArray(data.experience) && data.experience.length ? data.experience : DEFAULT_DATA.experience;
        const projects = Array.isArray(data.projects) && data.projects.length ? data.projects : DEFAULT_DATA.projects;

        // Calculate total professional experience automatically from the experience list.
        // Overlapping jobs are merged so the same month is never counted twice.
        function calculateExperience(experiences) {
            const now = new Date();
            const monthIndex = (year, month) => year * 12 + month;

            const ranges = experiences.map(item => {
                const start = new Date(item.start || "");
                if (Number.isNaN(start.getTime())) return null;

                const startMonth = monthIndex(start.getFullYear(), start.getMonth());
                let endMonth;

                if (String(item.end || "").trim().toLowerCase() === "present") {
                    endMonth = monthIndex(now.getFullYear(), now.getMonth());
                } else {
                    const end = new Date(item.end || "");
                    if (Number.isNaN(end.getTime())) return null;
                    endMonth = monthIndex(end.getFullYear(), end.getMonth());
                }

                return { start: startMonth, end: Math.max(startMonth, endMonth) + 1 };
            }).filter(Boolean);

            if (!ranges.length) return "0+";

            ranges.sort((a, b) => a.start - b.start);
            const merged = [];

            for (const range of ranges) {
                const last = merged[merged.length - 1];
                if (last && range.start <= last.end) {
                    last.end = Math.max(last.end, range.end);
                } else {
                    merged.push({...range});
                }
            }

            const totalMonths = merged.reduce((total, range) => total + (range.end - range.start), 0);
            const years = Math.floor(totalMonths / 12);
            const months = totalMonths % 12;

            if (years === 0) return `${months} month${months === 1 ? "" : "s"}`;
            if (months === 0) return `${years} year${years === 1 ? "" : "s"}`;
            return `${years} year${years === 1 ? "" : "s"} ${months} month${months === 1 ? "" : "s"}`;
        }

        const experienceDuration = calculateExperience(experience);
        setText("statExperience", experienceDuration);
        setText("heroExperience", experienceDuration);
        setText("statSkills", skills.length + "+");
        setText("statProjects", projects.length + "+");

        const skillsContainer = document.getElementById("skillsContainer");
        if (skillsContainer) skillsContainer.innerHTML = skills.map((s,i)=>`<div class="col-lg-4 col-md-6"><div class="skill-card"><div class="card-body"><div class="skill-number">SKILL ${String(i+1).padStart(2,"0")}</div><div class="skill-icon"><i class="${esc(s.icon||"fas fa-tools")}"></i></div><h4>${esc(s.name)}</h4><p>${esc(s.description||"")}</p></div></div></div>`).join("");

        const expContainer = document.getElementById("experienceContainer");
        if (expContainer) expContainer.innerHTML = experience.map((x,i)=>{
            const resp = Array.isArray(x.responsibilities)?x.responsibilities:String(x.responsibilities||"").split(/\r?\n/).filter(Boolean);
            const current = String(x.end||"").toLowerCase()==="present";
            return `<div class="exp-item"><div class="exp-dot">${String(i+1).padStart(2,"0")}</div><div class="exp-card">${current?'<span class="current-badge">CURRENT</span>':""}<h3>${esc(x.title)}</h3><h5>${esc(x.company)}</h5><div class="exp-duration"><i class="far fa-calendar"></i> ${esc(x.start)} - ${esc(x.end)}</div><ul>${resp.map(r=>`<li>${esc(r)}</li>`).join("")}</ul></div></div>`;
        }).join("");

        const projectContainer = document.getElementById("projectsContainer");
        if (projectContainer) projectContainer.innerHTML = projects.map((x,i)=>`<div class="col-lg-4 col-md-6"><div class="project-card"><img src="${esc(x.image||"images/background.jpg")}" class="project-image" alt="${esc(x.name)}" loading="lazy" onerror="this.onerror=null;this.src='images/background.jpg';"><div class="card-body"><div class="skill-number">PROJECT ${String(i+1).padStart(2,"0")}</div><h4>${esc(x.name)}</h4><p>${esc(x.description||"")}</p>${/^https?:\/\//i.test(x.link||"")?`<a class="project-link" href="${esc(x.link)}" target="_blank" rel="noopener">View Project <i class="fas fa-arrow-right"></i></a>`:""}</div></div></div>`).join("");
    }

    const resume = document.getElementById("resumeDownload");
    if (resume) { resume.href="assets/Akash_Jana_Resume.pdf"; resume.download="Akash_Jana_Resume.pdf"; }
    const resumeView = document.getElementById("resumeView");
    if (resumeView) { resumeView.href="assets/Akash_Jana_Resume.pdf"; resumeView.target="_blank"; resumeView.rel="noopener"; }

    const contactForm = document.getElementById("contactForm");
    if (contactForm) contactForm.addEventListener("submit", async e => {
        e.preventDefault();
        const body = {name:contactForm.elements.name?.value.trim(), email:contactForm.elements.email?.value.trim(), subject:contactForm.elements.subject?.value.trim(), message:contactForm.elements.message?.value.trim()};
        if (!body.name || !body.email || !body.message) { alert("Please fill in all required fields."); return; }
        try {
            const r = await fetch(MESSAGE_API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
            const text = await r.text(); let j={}; try{j=text?JSON.parse(text):{}}catch(_){throw new Error("Message API returned invalid JSON");}
            if (!r.ok) throw new Error(j.error||"Unable to send message");
            alert("Thank you. Your message has been sent."); contactForm.reset();
        } catch(err) {
            // Local Live Server has no /api/messages. Use email fallback instead of showing JSON errors.
            const mailto = "mailto:" + encodeURIComponent("akashjana171@gmail.com") + "?subject=" + encodeURIComponent(body.subject || "Portfolio Contact") + "&body=" + encodeURIComponent(`Name: ${body.name}\nEmail: ${body.email}\n\n${body.message}`);
            window.location.href = mailto;
        }
    });

    const navbar=document.querySelector(".navbar"), scrollTop=document.getElementById("scrollTop");
    window.addEventListener("scroll",()=>{if(navbar)navbar.classList.toggle("scrolled",window.scrollY>30);if(scrollTop)scrollTop.classList.toggle("show",window.scrollY>500);},{passive:true});
    if(scrollTop)scrollTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
    document.querySelectorAll('.navbar a[href^="#"], .footer-links a[href^="#"]').forEach(link=>link.addEventListener("click",()=>{const menu=document.getElementById("navbarNav");if(menu&&menu.classList.contains("show")&&window.bootstrap)bootstrap.Collapse.getOrCreateInstance(menu).hide();}));

    loadPortfolio();
});
