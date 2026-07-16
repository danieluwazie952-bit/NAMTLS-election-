import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{minHeight:'100vh',background:'#003366',color:'white',fontFamily:'Arial,sans-serif',position:'relative',padding:'32px'}}>
      
      {/* PLUS SIGN FOR ADMIN - TOP LEFT */}
      <Link to="/admin" style={{position:'absolute',top:'20px',left:'20px',fontSize:'32px',fontWeight:'bold',color:'white',textDecoration:'none',background:'#16a34a',width:'45px',height:'45px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}> + </Link>

      {/* CENTER CONTENT */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',minHeight:'calc(100vh - 64px)'}}>
        <img src="/logo.png" alt="NAMTLS Logo" style={{width:'120px',height:'120px',borderRadius:'50%',objectFit:'cover',marginBottom:'24px'}} onError={(e)=>{e.target.style.display='none'}} />
        
        <h1 style={{fontSize:'36px',fontWeight:'bold',margin:'0 0 32px 0',color:'#ffd700'}}>NAMATL STUDENT E-VOTING</h1>
        
        <Link to="/student-login" style={{padding:'14px 32px',background:'#2563eb',color:'white',textDecoration:'none',borderRadius:'6px',fontWeight:'bold',fontSize:'16px'}}>Student Login</Link>
      </div>
    </div>
  );
}