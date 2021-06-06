import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import { FC } from "preact/compat";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { api, handleError } from "../lib/api";
import { useLocation } from "wouter";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { LoginResponse } from "@flowtr/panel-sdk/src/api.js";

export const Login: FC<Record<string, unknown>> = () => {
    const [, setLocation] = useLocation();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const onSubmit = (data: { username: string; password: string }) => {
        console.log(data);
        api.post<LoginResponse>("/auth/login", data)
            .then((res) => {
                // TODO: better error message api
                if (res.status !== 200)
                    return toast(res.data.error?.translation);
                if (res.data.token)
                    localStorage.setItem("token", res.data.token);
                setLocation("/dashboard/profile");
            })
            .catch((err: AxiosError) => handleError(err));
    };

    return (
        <Flex flexDir="column" justifyContent="center" alignItems="center">
            <Heading as="h2">Login</Heading>
            <FormControl isRequired mb="1.5em">
                <FormLabel>Username</FormLabel>
                <Input
                    placeholder="joe"
                    {...register("username", { required: true })}
                />
            </FormControl>
            <FormControl isRequired mb="1.5em">
                <FormLabel>Password</FormLabel>
                <Input
                    type="password"
                    {...register("password", { required: true })}
                />
            </FormControl>
            <Button onClick={handleSubmit(onSubmit)}>Log In</Button>
        </Flex>
    );
};
