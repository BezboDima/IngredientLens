'use client'

import { useState } from 'react';
import { callPostGatewayApi } from '../../src/request';
import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";
import {Card, Input, CardBody, Button} from "@nextui-org/react";

export default function LoginPage() {

    const [userLogin, setUserLogin] = useState("");
    const [userPassword, setUserPassword] = useState("");

    const [isUserDataWrong, setIsUserDataWrong] = useState(false);

    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => setIsVisible(!isVisible);

    const handleSignUpClick = () => {
        window.location.href = "/signup"
    }
    const handleLoginClick = async () => {
        const data = {
            login: userLogin,
            password: userPassword
        }
        callPostGatewayApi("dynamo-get",data)
        .then(response => {

            if(response['status']){
                var token = userLogin
                document.cookie = `login=${token}; path=/`
                window.location.href = "/docs"
            }else{
                setIsUserDataWrong(true);
            }
        })
        .catch(error => {
            console.error(error);
        });

    }
    const handlePasswordChange = (e : any) => {
        setUserPassword(e.target.value);
    }
    const handleLoginChange = (e : any) => {
        setUserLogin(e.target.value);
    }
	return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
            <Card className="max-w-[600px] min-w-[400px] gap-4">
                <CardBody className="py-4">
                    {isUserDataWrong && (<h1>No such user</h1>)}
                    <Input 
                        type="email" 
                        variant="bordered" 
                        label="Email" 
                        placeholder="Enter your email" 
                        className="mb-4" 
                        onChange={handleLoginChange}/>
                    <Input
                        className="mb-4"
                        label="Password"
                        variant="bordered"
                        onChange={handlePasswordChange}
                        placeholder="Enter your password"
                        endContent={
                            <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                            {isVisible ? (
                                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                            ) : (
                                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                            )}
                            </button>
                        }
                        type={isVisible ? "text" : "password"}
                        />
                    <div className="flex flex-wrap gap-4 items-center" style={{justifyContent: 'center'}}>
                        <Button color="primary" variant="ghost" size="md" className="grow" onClick={handleSignUpClick}>
                            Sign Up
                        </Button>  
                        <Button color="primary" variant="solid" size="md" className="grow" onClick={handleLoginClick}>
                            Login
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
		
	);
}