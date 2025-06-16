import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const withAuth = (wrappedcomponent) =>{
    const Authcomponent = (props)=>{
        const navigate = useNavigate()

        const isAuthenticated = ()=>{
            if(localStorage.getItem("token")){
                return true
            }
            return false
        }
        useEffect(()=>{
            if(!isAuthenticated()){
                navigate("/")
            }
        },[])
        return <wrappedcomponent{...props}/>
    }
    return Authcomponent;
}

export default withAuth