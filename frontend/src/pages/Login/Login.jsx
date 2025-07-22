import React, { useState } from "react";
import Passwordinput from "../../components/input/Passwordinput";
import { Link } from "react-router-dom";
import { validateEmail} from "../../utlis/helper";

function Login() {
  const [email, setEmail] = useState("");
  const [passwword, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleLogin = async(e)=> {
    e.preventDefault()
    if(!validateEmail(email)){
      setError('please enter a vaild email')
      return
    }

    if(!passwword){
      setError("please enter the password")
      return
    }
    setError("")
    //Log in api
    }
  
   

  return (
    <div className="flex items-center justify-center mt-20">
      <div className="w-96 border rounded bg-white px-7 py-10">
        <div onSubmit={handleLogin}>
          <form>
            <h4 className="text-2xl mb-7 ">Login</h4>
            <input
              type="text"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Passwordinput
              value={passwword}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-600 text-sm pb-1"> {error} </p>}
            <button type="submit" className="btn-primary">
              LOGIN
            </button>

            <p className="text-sm text-center mt-4">
              Not registered yet?{" "}
              <Link
                to={"/Signup"}
                className="font-medium underline text-blue-500 "
              >
                {" "}
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
