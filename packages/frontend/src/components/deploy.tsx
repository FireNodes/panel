import {
    Button,
    Flex,
    Heading,
    Text,
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
} from "@chakra-ui/react";
import { api } from "../lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCloudUploadAlt,
    faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useLocation } from "wouter";

export const DeployForm = () => {
    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting },
    } = useForm();
    const [, setLocation] = useLocation();

    const onSubmit = (data: { name: string; image: string }) => {
        api.deploy({
            name: data.name,
            image: data.image,
        }).then((res) => {
            toast.dark(
                <Flex
                    flexDir="row"
                    justifyContent="flex-start"
                    alignItems="center"
                >
                    <FontAwesomeIcon icon={faCloudUploadAlt} mr="1.5em" />
                    <Text>✅ Deployed {res.data.deployment?.id}</Text>
                </Flex>
            );
            setLocation("/dashboard/deployments");
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Flex
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                flexWrap="wrap"
            >
                {" "}
                <Heading as="h2" mb="0.5em">
                    Deploy
                </Heading>
                <FormControl isInvalid={errors.name} mb="1.5em">
                    <FormLabel htmlFor="name">Deployment name</FormLabel>
                    <Input
                        id="name"
                        placeholder="test"
                        {...register("name", {
                            required: true,
                            minLength: 1,
                        })}
                    />
                    <FormErrorMessage>
                        {errors.name && errors.name.message}
                    </FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={errors.image} mb="1.5em">
                    <FormLabel htmlFor="image">Deployment image</FormLabel>
                    <Input
                        id="image"
                        placeholder="nginx:alpine"
                        {...register("image", {
                            required: true,
                            minLength: 1,
                        })}
                    />
                    <FormErrorMessage>
                        {errors.image && errors.image.message}
                    </FormErrorMessage>
                </FormControl>
                <Button isLoading={isSubmitting} type="submit" mb="1.5em">
                    <FontAwesomeIcon icon={faPaperPlane} />
                    <Text ml="0.5em">Deploy</Text>
                </Button>
            </Flex>
        </form>
    );
};
