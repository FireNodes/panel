import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { IContainer, toTitleCase } from "@flowtr/panel-sdk";
import { useEffect, useState } from "preact/hooks";
import { api } from "../lib/api";

export const ContainerList = () => {
    const [containers, setContainers] = useState<IContainer[]>([]);
    const [reload, setReload] = useState<boolean>(false);

    useEffect(() => {
        api.getDeployments().then((res) => setContainers(res.data.containers));
    }, [reload]);

    return (
        <Flex
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            flexWrap="wrap"
        >
            <Button onClick={() => setReload(!reload)} mb="1.5em">
                <RepeatIcon />
            </Button>
            <Flex
                justifyContent="center"
                alignItems="center"
                flexDirection="row"
                flexWrap="wrap"
            >
                {containers.map((c) => (
                    <Flex
                        justifyContent="center"
                        alignItems="center"
                        flexDirection="column"
                        bg="gray.700"
                        p="1.5em"
                        borderRadius="1.5em"
                    >
                        <Flex
                            justifyContent="center"
                            alignItems="center"
                            flexDirection="column"
                            mb="1.5em"
                        >
                            <Heading as="h3" fontSize="1.5em">
                                Identifier
                            </Heading>
                            <Text>{c.id}</Text>
                        </Flex>

                        <Flex
                            justifyContent="center"
                            alignItems="center"
                            flexDirection="column"
                            mb="1.5em"
                        >
                            <Heading as="h3" fontSize="1.5em">
                                Status
                            </Heading>
                            <Text>{toTitleCase(c.status)}</Text>
                        </Flex>

                        {c.imageID && (
                            <Flex
                                justifyContent="center"
                                alignItems="center"
                                flexDirection="column"
                                mb="1.5em"
                            >
                                <Heading as="h3" fontSize="1.5em">
                                    Image Identifier
                                </Heading>
                                <Text>{c.imageID}</Text>
                            </Flex>
                        )}

                        {c.names && (
                            <Flex
                                justifyContent="center"
                                alignItems="center"
                                flexDirection="column"
                            >
                                <Heading as="h3" fontSize="1.5em">
                                    Names
                                </Heading>
                                <Text>{c.names.join(", ")}</Text>
                            </Flex>
                        )}
                    </Flex>
                ))}
            </Flex>
        </Flex>
    );
};
