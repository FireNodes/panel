import { Avatar, Flex, Heading, Link } from "@chakra-ui/react";
import { Link as WLink } from "wouter";
import {} from "@chakra-ui/icons";
export const Header = () => (
    <Flex
        justifyContent="center"
        alignItems="center"
        minHeight="1.5em"
        p="1.5em"
        mb="1.5em"
        width="100%"
        backgroundColor="blackAlpha.300"
    >
        <Heading color="pink.500" fontWeight="bold">
            <Link as={WLink} href="/">
                Flowtr Panel
            </Link>
        </Heading>
        <Flex
            className="header-profile"
            justifyContent="center"
            ml="auto"
            alignItems="center"
        >
            <Link
                as={WLink}
                href={
                    localStorage.getItem("token") !== null
                        ? "/dashboard/profile"
                        : "/dashboard/login"
                }
            >
                <Avatar alt="Dashboard" />
            </Link>
        </Flex>
    </Flex>
);
