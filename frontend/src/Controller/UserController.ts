
import axios, {AxiosError} from 'axios';

const URL_LOGIN = process.env.REACT_APP_API_URL_LOGIN;
const URL_SIGNUP = process.env.REACT_APP_API_URL_SIGNUP;
const URL_DELETE = process.env.REACT_APP_API_URL_DELETE;
const URL_LOGOUT = process.env.REACT_APP_API_URL_LOGOUT;

export async function VerifyUser (username: string, password:string): Promise<boolean | string>
{
  try 
  {
    const respone = await axios.post(`${URL_LOGIN}`, {
      username: username,
      password: password
    });
    console.log('Login seccessful: ', respone.data);
    return true; 
  } catch (err:unknown) {
    const error = err as AxiosError;
    if(error.response){
      console.error("invalid user", error); 
      return "Invalid username/password combination"; 
    } else {
      console.error('Login failed',error);
      return "Couldn't reach server. Please check your internet connection";
    }
  }
}

export async function CreateUser (name:string, lastname:string, username:string, age: number, password:string, isAdmin:boolean) : Promise<boolean>
{
  try 
  {
    const respone = await axios.post(`${URL_SIGNUP}`,{
      username: username,
      password: password,
      name: name,
      lastname:lastname,
      isAdmin: isAdmin,
      age:age
    });
    console.log('Sign Up seccessful ', respone.data);
    return true
  } catch (error) {
    console.error('Sign Up failed', error);
    return false;
  }
}

export async function DeleteUser(username: string) {
  try {
    console.log(username); 
    const response = await axios.delete(`${URL_DELETE}`, {
      data: {username: username}
    });
    console.log("Deletion of user successful", response.data);
    return true;
  } catch (error) {
    console.error("Deletion of user unsuccessful", error);
    return false;
  }
}

export async function LogOut() {
  try {
    const response = await axios.get(`${URL_LOGOUT}`);
    console.log("Logout successful");
    return true;
  } catch (error) {
    console.log("Logout unsuccessful");
    return false;
  }
}

/*
export function CreateUser(name: string, username: string, age: string, password: string, 
    lastname:string, key: string, isAdmin:boolean): IUser | string{   
        const user: IUser = {
            name:name, 
            username: username, 
            age: age, 
            password: password, 
            lastname: lastname, 
            key: key, 
            isAdmin: isAdmin
        }; 
        if(!name || !username || !age || !password || !lastname){
          return "invalid fields"; 
        } 
        else if(parseInt(age) <=17)
        {
          return "You need to be at least 18 years old"
        }
        profiles.forEach(user => {
          if(user.username === username){
            return "username already in use"; 
          }
        })
        return user; 
}*/

