import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../style.css";
import { apiGet } from "../../../apis/academyApi";
import { getRoles, getUsers } from "../../../apis/adminApi";
import type { AdminRole, AdminUser } from "../../../Types/Admin";
import type { Paginated } from "../../../Types/Paginated";
import type { CourseListItemDto } from "../../../Types/AcademyApi";
import { getStaffSchedule, getStaffAssignments, getStaffPayouts, getStaffStudents } from "../../../apis/staffApi";

type PageConfig = { eyebrow: string; title: string; subtitle: string; icon: string; stats: {label:string;value:string;icon:string}[]; columns:string[]; rows:string[][]; actions:string[]; note:string };
const configs: Record<string, PageConfig> = {
  "/admin/instructors": { eyebrow:"ACADEMY OPERATIONS", title:"Instructor management", subtitle:"Manage teaching profiles, specializations, workload and compensation rates.", icon:"school", stats:[{label:"Total instructors",value:"—",icon:"groups"},{label:"Active",value:"—",icon:"verified_user"},{label:"Teaching load",value:"—",icon:"calendar_month"}], columns:["Instructor","Specialization","Teaching load","Rate","Status"], rows:[], actions:["Add instructor","Export list"], note:"Instructor records will appear when the instructor-management API is connected." },
  "/admin/students": { eyebrow:"ACADEMY OPERATIONS", title:"Student management", subtitle:"Review student accounts, enrollments, learning progress and account status.", icon:"groups", stats:[{label:"Students",value:"—",icon:"groups"},{label:"Active enrollments",value:"—",icon:"school"},{label:"Needs attention",value:"—",icon:"flag"}], columns:["Student","Course","Progress","Last activity","Status"], rows:[], actions:["Add student","Export list"], note:"Student records and progress will appear when the relevant APIs are connected." },
  "/admin/courses": { eyebrow:"ACADEMY OPERATIONS", title:"Course management", subtitle:"Manage the course register, instructors, enrollment capacity, pricing and status.", icon:"menu_book", stats:[{label:"Courses",value:"—",icon:"menu_book"},{label:"Running",value:"—",icon:"play_circle"},{label:"Enrollments",value:"—",icon:"groups"}], columns:["Course","Code","Instructor","Capacity","Price","Status"], rows:[], actions:["Create course","Export list"], note:"Course records will appear when the course-management API is connected." },
  "/admin/schedule": { eyebrow:"ACADEMY OPERATIONS", title:"Academy schedule", subtitle:"Coordinate sessions across courses, instructors and students. Check times and classroom access in one place.", icon:"calendar_month", stats:[{label:"Sessions today",value:"—",icon:"today"},{label:"Upcoming",value:"—",icon:"event_upcoming"},{label:"Live now",value:"—",icon:"videocam"}], columns:["Session","Course","Instructor","Date & time","Students","Status"], rows:[], actions:["Schedule session","Calendar view"], note:"The calendar will show authoritative session data, timezone and Zoom links when the schedule API is connected." },
  "/admin/compensation": { eyebrow:"FINANCE", title:"Instructor compensation", subtitle:"Review pending instructor payouts and approved financial transactions before payout.", icon:"payments", stats:[{label:"Pending payout",value:"—",icon:"pending_actions"},{label:"Approved this month",value:"—",icon:"task_alt"},{label:"Recent transactions",value:"—",icon:"receipt_long"}], columns:["Instructor","Period","Sessions","Amount","Approval status"], rows:[], actions:["Review pending","Export transactions"], note:"Compensation data is intentionally separate from student payments and academy revenue." },
  "/admin/reports": { eyebrow:"INSIGHTS", title:"Reports & analytics", subtitle:"Monitor academy growth, teaching delivery and financial performance over time.", icon:"analytics", stats:[{label:"Student growth",value:"—",icon:"trending_up"},{label:"Sessions delivered",value:"—",icon:"event_available"},{label:"Revenue",value:"—",icon:"payments"}], columns:["Report","Period","Updated","Status"], rows:[], actions:["Operational report","Financial report","Export report"], note:"Date, course and instructor filters and exportable reports will use the reporting API when available." },
  "/admin/permissions": { eyebrow:"SECURITY", title:"Roles & permissions", subtitle:"Review role access and keep sensitive finance and administration actions restricted.", icon:"admin_panel_settings", stats:[{label:"Roles",value:"—",icon:"badge"},{label:"Permissions",value:"—",icon:"verified_user"},{label:"Pending reviews",value:"—",icon:"fact_check"}], columns:["Role","Workspace access","Finance access","User management","Status"], rows:[], actions:["Review roles","Audit permissions"], note:"The API remains the authority for permission enforcement; this workspace does not grant permissions by itself." },
  "/instructor/schedule": { eyebrow:"TEACHING WORKSPACE", title:"My schedule", subtitle:"See only your assigned sessions, with class time, course details and classroom access.", icon:"calendar_month", stats:[{label:"Today",value:"—",icon:"today"},{label:"This week",value:"—",icon:"date_range"},{label:"Completed",value:"—",icon:"task_alt"}], columns:["Time","Course","Students","Duration","Classroom"], rows:[], actions:["Today","Week","Month"], note:"Only sessions assigned to your instructor account should be displayed here." },
  "/instructor/assignments": { eyebrow:"TEACHING WORKSPACE", title:"Assignments & grading", subtitle:"Create course work, track submissions and provide feedback to enrolled students.", icon:"assignment", stats:[{label:"Assignments",value:"—",icon:"assignment"},{label:"To grade",value:"—",icon:"rate_review"},{label:"Graded",value:"—",icon:"task_alt"}], columns:["Assignment","Course","Due date","Submissions","Status"], rows:[], actions:["Create assignment","Review submissions"], note:"Student eligibility should come from coordinator-approved enrollments. Submission and grading data will load from the assignment APIs." },
  "/instructor/messages": { eyebrow:"TEACHING WORKSPACE", title:"Student messages", subtitle:"Keep course-related questions and responses together in one place.", icon:"forum", stats:[{label:"Conversations",value:"—",icon:"forum"},{label:"Unread",value:"—",icon:"mark_chat_unread"},{label:"Awaiting reply",value:"—",icon:"schedule"}], columns:["Student","Course","Last message","Updated","Status"], rows:[], actions:["Unread","All conversations"], note:"Messages will be scoped to your assigned students and courses when the messaging API is connected." },
  "/instructor/earnings": { eyebrow:"MY FINANCES", title:"My earnings", subtitle:"Review your personal earnings and approved items without academy-wide financial data.", icon:"payments", stats:[{label:"This month",value:"—",icon:"calendar_month"},{label:"Pending",value:"—",icon:"pending_actions"},{label:"Approved",value:"—",icon:"task_alt"}], columns:["Date","Course / session","Pay model","Amount","Status"], rows:[], actions:["Current month","Earnings history"], note:"Only your own earnings and approved transactions belong in this view." },
  "/instructor/availability": { eyebrow:"TEACHING WORKSPACE", title:"My availability", subtitle:"Set the teaching windows coordinators can use when arranging sessions.", icon:"event_available", stats:[{label:"Available windows",value:"—",icon:"event_available"},{label:"Booked windows",value:"—",icon:"event_busy"},{label:"Upcoming sessions",value:"—",icon:"calendar_month"}], columns:["Day","Available from","Available to","Timezone","Status"], rows:[], actions:["Add availability","Save changes"], note:"Availability is provided by the instructor; coordinators schedule sessions within these windows. Changes will be saved once the availability API is available." },
};
export default function StaffWorkspacePage(){
 const {pathname}=useLocation(); const config=configs[pathname] ?? configs["/admin/reports"];
 const [query,setQuery]=useState(""); const [period,setPeriod]=useState("This month"); const [notice,setNotice]=useState("");
 const [liveRows,setLiveRows]=useState<string[][]>(config.rows); const [liveStats,setLiveStats]=useState(config.stats); const [loading,setLoading]=useState(false); const [loadError,setLoadError]=useState("");
 useEffect(()=>{
  const controller=new AbortController();
  const signal=controller.signal;
  setLiveRows(config.rows); setLiveStats(config.stats); setLoadError("");
  const setCount=(label:string,value:string)=>setLiveStats(prev=>prev.map(item=>item.label===label?{...item,value}:item));
  const load=async()=>{
   if(["/admin/instructors","/admin/students"].includes(pathname)){
    setLoading(true);
    try{
     const role=pathname==="/admin/students"?"Learner":"Instructor";
     const result=await getUsers({role,page:1,pageSize:100},signal);
     if(signal.aborted)return;
     setLiveRows(result.data.map((u:AdminUser)=>pathname==="/admin/students"
      ?[u.fullName,u.email,"—",new Date(u.createdAt).toLocaleDateString(),u.isActive?"Active":"Inactive"]
      :[u.fullName,u.email,"—","—",u.isActive?"Active":"Inactive"]));
     setCount(pathname==="/admin/students"?"Students":"Total instructors",String(result.count));
     if(pathname==="/admin/instructors")setCount("Active",String(result.data.filter(u=>u.isActive).length));
    }catch(e){if(!signal.aborted)setLoadError(e instanceof Error?e.message:"Could not load users.");}
    finally{if(!signal.aborted)setLoading(false);}
   } else if(pathname==="/admin/courses"){
    setLoading(true);
    try{
     const result=await apiGet<Paginated<CourseListItemDto>>("/api/courses",{page:1,pageSize:100},signal);
     if(signal.aborted)return;
     setLiveRows(result.data.map(c=>[c.title,c.slug,c.mentor||"—",c.seats||"—",`${c.tuition} ${c.currency||""}`.trim(),"Listed"]));
     setCount("Courses",String(result.count));
    }catch(e){if(!signal.aborted)setLoadError(e instanceof Error?e.message:"Could not load courses.");}
    finally{if(!signal.aborted)setLoading(false);}
   } else if(pathname==="/admin/schedule" || pathname==="/instructor/schedule"){
    setLoading(true);
    try{
     const rows=await getStaffSchedule(undefined,signal); if(signal.aborted)return;
     setLiveRows(rows.map(r=>pathname==="/admin/schedule" ? [r.title || r.courseTitle,r.courseTitle,r.batchCode || "—",`${r.date} ${r.startTime}–${r.endTime}`,r.roomDetails || "—","Scheduled"] : [`${r.date} ${r.startTime}–${r.endTime}`,r.courseTitle,"—",`${r.endTime}`,r.roomDetails || "—"]));
     setCount("Sessions today",String(rows.filter(r=>r.date===new Date().toISOString().slice(0,10)).length));
     setCount("Upcoming",String(rows.filter(r=>new Date(`${r.date}T${r.startTime}`)>=new Date()).length));
    }catch(e){if(!signal.aborted)setLoadError(e instanceof Error?e.message:"Could not load schedule.");}
    finally{if(!signal.aborted)setLoading(false);}
   } else if(pathname==="/instructor/assignments"){
    setLoading(true);
    try{
     const rows=await getStaffAssignments(signal); if(signal.aborted)return;
     setLiveRows(rows.map(r=>[r.title,r.courseTitle,new Date(r.dueDate).toLocaleString(),String(r.submissions),new Date(r.dueDate)<new Date()?"Past due":"Open"]));
     setCount("Assignments",String(rows.length)); setCount("To grade",String(rows.reduce((sum,r)=>sum+r.submissions,0)));
    }catch(e){if(!signal.aborted)setLoadError(e instanceof Error?e.message:"Could not load assignments.");}
    finally{if(!signal.aborted)setLoading(false);}
   } else if(pathname==="/admin/compensation" || pathname==="/instructor/earnings"){
    setLoading(true);
    try{
     const rows=await getStaffPayouts(signal); if(signal.aborted)return;
     setLiveRows(rows.map(r=>[r.instructorName,new Date(r.createdAt).toLocaleDateString(),r.scheduleId?String(r.scheduleId):"—",`${r.amount} ${r.currency}`,String(r.status)]));
     setCount(pathname==="/admin/compensation"?"Pending payout":"Pending",String(rows.filter(r=>String(r.status).toLowerCase()==="pending"||r.status===0).length));
     setCount(pathname==="/admin/compensation"?"Recent transactions":"Approved",String(rows.length));
    }catch(e){if(!signal.aborted)setLoadError(e instanceof Error?e.message:"Could not load payouts.");}
    finally{if(!signal.aborted)setLoading(false);}
   } else if(pathname==="/admin/permissions"){
    setLoading(true);
    try{
     const roles:AdminRole[]=await getRoles(signal);
     if(signal.aborted)return;
     setLiveRows(roles.map(r=>[r.name, r.permissions.length?`${r.permissions.length} permissions`:"No permissions",r.permissions.some(p=>p.toLowerCase().includes("finance"))?"Yes":"No",r.permissions.some(p=>p.toLowerCase().includes("users.manage"))?"Yes":"No","Configured"]));
     setCount("Roles",String(roles.length));
     setCount("Permissions",String(new Set(roles.flatMap(r=>r.permissions)).size));
    }catch(e){if(!signal.aborted)setLoadError(e instanceof Error?e.message:"Could not load roles.");}
    finally{if(!signal.aborted)setLoading(false);}
   }
  };
  void load(); return ()=>controller.abort();
 },[pathname]);
 const filteredRows=useMemo(()=>liveRows.filter(r=>r.join(" ").toLowerCase().includes(query.toLowerCase())),[liveRows,query]);
 return <div className="staff-dashboard staff-workspace-page">
  <header className="staff-page_head"><div><div className="staff-eyebrow">{config.eyebrow}</div><h1 className="staff-page_title">{config.title}</h1><p className="staff-page_sub">{config.subtitle}</p></div><div className="staff-workspace-head-actions"><label className="staff-select-label">Period <select className="staff-select" value={period} onChange={e=>setPeriod(e.target.value)}><option>This week</option><option>This month</option><option>This year</option><option>All time</option></select></label>{config.actions.slice(0,1).map(a=><button className="staff-workspace-primary" key={a} onClick={()=>setNotice(`${a}: connect the relevant API to enable this action.`)}><span className="material-symbols-outlined">add</span>{a}</button>)}</div></header>
  <section className="staff-workspace-stats">{liveStats.map(s=><article className="staff-workspace-stat" key={s.label}><span className="material-symbols-outlined">{s.icon}</span><small>{s.label}</small><strong>{s.value}</strong><em>Awaiting live data</em></article>)}</section>
  <section className="staff-card staff-workspace-table-card"><div className="staff-card_head"><div><h2>{config.title} register</h2><p className="staff-page_sub">Search, review and manage the records available to your role.</p></div><span className="material-symbols-outlined staff-workspace-card-icon">{config.icon}</span></div>
   <div className="staff-toolbar"><input className="staff-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`} aria-label={`Search ${config.title}`}/><button className="staff-workspace-secondary" onClick={()=>{setQuery("");setPeriod("This month");}}>Reset filters</button>{config.actions.slice(1).map(a=><button className="staff-workspace-secondary" key={a} onClick={()=>setNotice(`${a}: connect the relevant API to enable this action.`)}>{a}</button>)}</div>
   {notice&&<p className="staff-workspace-notice" role="status">{notice}</p>}
   {loadError&&<p className="staff-workspace-notice" role="alert">Could not load live data: {loadError}</p>}
   {loading&&<p className="staff-workspace-notice" role="status">Loading live records…</p>}
   <div className="staff-table-wrap"><table className="staff-table"><thead><tr>{config.columns.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{filteredRows.length?filteredRows.map((r,i)=><tr key={i}>{r.map((cell,j)=><td key={j}>{cell}</td>)}</tr>):<tr><td colSpan={config.columns.length}><div className="staff-workspace-empty"><span className="material-symbols-outlined">{config.icon}</span><strong>{query?"No matching records":loading?"Loading records…":"No records to display yet"}</strong><p>{query?"Try another search term.":loadError?"Check the API and your permissions, then retry.":config.note}</p></div></td></tr>}</tbody></table></div>
   <div className="staff-workspace-foot"><span>Showing {filteredRows.length} records</span><span>Period: {period}</span></div>
  </section>
  <nav className="staff-workspace-related" aria-label="Related workspace pages"><strong>Workspace navigation</strong>{(pathname.startsWith("/admin")?[["/admin","Overview"],["/admin/instructors","Instructors"],["/admin/students","Students"],["/admin/courses","Courses"],["/admin/schedule","Schedule"],["/admin/compensation","Compensation"],["/admin/reports","Reports"],["/admin/permissions","Roles & permissions"]]:[["/instructor","Overview"],["/instructor/schedule","My schedule"],["/instructor/assignments","Assignments"],["/instructor/messages","Messages"],["/instructor/earnings","My earnings"],["/instructor/availability","Availability"]]).map(([to,label])=><Link key={to} to={to} className={pathname===to?"is-current":""}>{label}<span className="material-symbols-outlined">arrow_forward</span></Link>)}</nav>
 </div>;
}
