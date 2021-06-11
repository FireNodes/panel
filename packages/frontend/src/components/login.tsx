import { Button, Flex, Heading, Image, Text } from "@chakra-ui/react";
import { FC } from "preact/compat";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { api, handleError } from "../lib/api";
import { useLocation } from "wouter";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";

export const Login: FC<Record<string, unknown>> = () => {
    const [, setLocation] = useLocation();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const onSubmit = (data: { username: string; password: string }) => {
        console.log(data);
        api.login(data).then(() => setLocation("/dashboard/profile"));
    };

    return (
        <Flex flexDir="column" justifyContent="center" alignItems="center">
            <Heading
                as="h2"
                mb="0.75em"
                fontFamily="Open Sans"
                fontWeight="bold"
            >
                Login
            </Heading>
            <FormControl isRequired mb="1.5em">
                <FormLabel>Username</FormLabel>
                <Input
                    placeholder="TheoParis"
                    {...register("username", { required: true })}
                />
            </FormControl>
            <FormControl isRequired mb="1.5em">
                <FormLabel>Password</FormLabel>
                <Input
                    type="password"
                    placeholder="******"
                    {...register("password", { required: true })}
                />
            </FormControl>
            <Flex flexDir="column" justifyContent="center" alignItems="center">
                <Button
                    fontFamily="Poppins"
                    onClick={handleSubmit(onSubmit)}
                    mr="1.5em"
                >
                    <Flex mr="0.5em">
                        <FontAwesomeIcon icon={faSignInAlt} />
                    </Flex>
                    Log In
                </Button>
                {/* <Button
                    backgroundColor="#5865F2"
                    img
                    onClick={handleSubmit(onSubmit)}
                >
                    <Image
                        boxSize="1.25em"
                        mr="0.50em"
                        src="https://discord.com/assets/9f6f9cd156ce35e2d94c0e62e3eff462.png"
                    />
                    Discord
                </Button> */}
            </Flex>
        </Flex>
    );
};
