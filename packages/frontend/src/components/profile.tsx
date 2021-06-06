import { Flex, Text, Heading, Button } from "@chakra-ui/react";
import { FC } from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import { IUser, ProfileResponse, toTitleCase } from "@flowtr/panel-sdk";
import { api, handleError } from "../lib/api";
import { useLocation } from "wouter";
import { toast } from "react-toastify";

export const Profile: FC<Record<string, unknown>> = () => {
    const [user, setUser] = useState<IUser | undefined>(undefined);
    const [, setLocation] = useLocation();

    useEffect(() => {
        api.get<ProfileResponse>("/auth/profile", {
            headers: {
                Authorization: localStorage.getItem("token"),
            },
        })
            .then((res) => {
                if (res.status !== 200)
                    return toast(res.data.error?.translation);
                setUser(res.data.user);
                if (!res.data.user) setLocation("/dashboard/login");
            })
            .catch((err) => handleError(err));
    }, []);

    return (
        <Flex flexDir="column" justifyContent="center" alignItems="center">
            <Heading as="h2">Welcome, {toTitleCase(user?.username)}</Heading>
            <Button
                onClick={() => {
                    localStorage.removeItem("token");
                    setLocation("/dashboard/login");
                }}
            >
                Log Out
            </Button>
        </Flex>
    );
};
