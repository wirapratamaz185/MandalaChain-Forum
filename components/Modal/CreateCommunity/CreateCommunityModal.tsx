// components/Modal/CreateCommunity/CreateCommunityModal.tsx
import useCustomToast from "@/hooks/useCustomToast";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { ChangeEvent, FC, useState } from "react";
import { IconType } from "react-icons";
import { BsFillEyeFill, BsFillPersonFill } from "react-icons/bs";
import { HiLockClosed } from "react-icons/hi";

/**
 * Options for the community type that can be created.
 * @param {public, restricted, private} - community types
 * @param {BsFillPersonFill, BsFillEyeFill, HiLockClosed} - icons for the community types
 * @param {Public, Restricted, Private} - labels for the community types
 */
const COMMUNITY_TYPE_OPTIONS = [
  {
    name: "public",
    icon: BsFillPersonFill,
    label: "Public",
    description: "Everyone can view and post",
  },
  {
    name: "private",
    icon: HiLockClosed,
    label: "Private",
    description: "Only subscribers can view and post",
  },
];

/**
 * Controls whether the modal is open or closed by its state.
 * Handles closing the modal.
 * @param {boolean} open - controls whether the modal is open or closed by its state
 * @param {() => void} handleClose - handles closing the modal
 */
type CreateCommunityModalProps = {
  open: boolean;
  handleClose: () => void;
};

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  open,
  handleClose,
}) => {
  const communityNameLengthLimit = 25;
  const [communityName, setCommunityName] = useState("");
  const [charRemaining, setCharRemaining] = useState(communityNameLengthLimit);
  const [communityType, setCommunityType] = useState("public");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const showToast = useCustomToast();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > communityNameLengthLimit) return; // community is not created if the name is above the limit
    setCommunityName(event.target.value); // updates the state of `communityName`
    setCharRemaining(communityNameLengthLimit - event.target.value.length); // computing remaining characters for community names
  };

  const onCommunityTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCommunityType(event.target.name);
  };

  const handleCreateCommunity = async () => {
    const apiCommunityType = communityType.toUpperCase();
    if (error) setError("");
    // prevents community from being created if its too short
    if (communityName.trim().length < 3) {
      setError("Community name must be at least 3 characters long");
      return;
    }
    // prevents community from being created if it has special characters
    if (/[^a-zA-Z0-9 ]/.test(communityName)) {
      setError("Community name can only contain letters, numbers, and spaces");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/community/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: communityName,
          communityType: apiCommunityType,
        }),
      });


      if (!response.ok) {
        console.log("help");
        throw new Error(`HTTP Error: ${response.statusText}`);
      }

      const data = await response.json();

      console.log("=====================================")
      console.log("Response Post:", response);
      console.log("=====================================")
      console.log("Data Post:", data);
      console.log("=====================================")

      if (typeof data === 'object' && data !== null) {
        router.push(`/community/${data.data.id}`);
        showToast({
          title: "Community created and subscribed successfully",
          status: "success",
        });
      } else {
        throw new Error('Unexpected API response: ' + JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error creating community", error);
      showToast({
        title: "Error creating community",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={open} onClose={handleClose}>
        <ModalOverlay
          bg="rgba(0, 0, 0, 0.4)"
          backdropFilter="auto"
          backdropBlur="5px"
        />
        <ModalContent borderRadius={10}>
          <ModalHeader
            display="flex"
            flexDirection="column"
            // fontSize={15}
            padding={3}
            textAlign="center"
          >
            Create Community
          </ModalHeader>
          <Box pl={3} pr={3}>
            <ModalCloseButton />
            <ModalBody display="flex" flexDirection="column" padding="10px 0px">
              <CommunityNameSection
                communityName={communityName}
                handleChange={handleChange}
                charRemaining={charRemaining}
                error={error}
              />
              <Box mt={4} mb={4}>
                <Text fontWeight={600} fontSize={15}>
                  Community Type
                </Text>

                <CommunityTypeOptions
                  options={COMMUNITY_TYPE_OPTIONS}
                  communityType={communityType}
                  onCommunityTypeChange={onCommunityTypeChange}
                />
              </Box>
            </ModalBody>
          </Box>

          <ModalFooter bg="gray.100" borderRadius="0px 0px 10px 10px">
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Button
                variant="outline"
                height="30px"
                width="100%"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                height="30px"
                width="100%"
                onClick={handleCreateCommunity}
                isLoading={loading}
                _hover={{ bg: "blue.500", color: "white" }}
              >
                Create Community
              </Button>
            </Stack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

type CommunityTypeOptionProps = {
  name: string;
  icon: IconType;
  label: string;
  description: string;
  isChecked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const CommunityTypeOption: FC<CommunityTypeOptionProps> = ({
  name,
  icon,
  label,
  description,
  isChecked,
  onChange,
}) => {
  return (
    <Checkbox
      name={name}
      isChecked={isChecked}
      onChange={onChange}
      colorScheme="red"
    >
      <Flex align="center">
        <Icon as={icon} color="gray.500" mr={2} />
        <Text fontSize="10pt" mr={1}>
          {label}
        </Text>
        <Text fontSize="8pt" color="gray.500" pt={1}>
          {description}
        </Text>
      </Flex>
    </Checkbox>
  );
};

/**
 * @param {CommunityTypeOptionProps[]} options - array of community type options
 * @param {string} communityType - community type selected
 * @param {React.ChangeEvent<HTMLInputElement>} onCommunityTypeChange - change in HTML input field
 */
interface CommunityTypeOptionsProps {
  options: {
    name: string;
    icon: IconType;
    label: string;
    description: string;
  }[];
  communityType: string;
  onCommunityTypeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CommunityTypeOptions: React.FC<CommunityTypeOptionsProps> = ({
  options,
  communityType,
  onCommunityTypeChange,
}) => {
  return (
    <div>
      {options.map((option) => (
        <CommunityTypeOption
          key={option.name}
          name={option.name}
          icon={option.icon}
          label={option.label}
          description={option.description}
          isChecked={communityType === option.name}
          onChange={onCommunityTypeChange}
        />
      ))}
    </div>
  );
};


interface CommunityNameSectionProps {
  communityName: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  charRemaining: number;
  error: string;
}

/**
 * Section of the modal form for entering community name to be created.
 * @param {string} communityName - name of the community
 * @param {React.ChangeEvent<HTMLInputElement>} handleChange - change in HTML input field
 * @param {number} charRemaining - number of characters remaining for the community name
 * @param {string} error - error message
 * @returns {React.FC} - section for entering community name
 */
const CommunityNameSection: React.FC<CommunityNameSectionProps> = ({
  communityName,
  handleChange,
  charRemaining,
  error,
}) => {
  return (
    <Box>
      <Text fontWeight={600} fontSize={15}>
        Name
      </Text>
      <Text fontSize={11} color="gray.500">
        Community names cannot be changed
      </Text>
      <Input
        mt={2}
        value={communityName}
        placeholder="Community Name"
        onChange={handleChange}
        fontSize="10pt"
        _placeholder={{ color: "gray.500" }}
        _hover={{
          bg: "white",
          border: "1px solid",
          borderColor: "blue.500",
        }}
        _focus={{
          outline: "none",
          border: "1px solid",
          borderColor: "blue.500",
        }}
      />
      <Text
        fontSize="9pt"
        mt={1}
        color={charRemaining === 0 ? "red" : "gray.500"}
      >
        {/* Updates the remaining characters in real time
        The colour changes to red if the limit is hit */}
        {charRemaining} Characters remaining
      </Text>
      <Text fontSize="9pt" color="red" pt={1}>
        {error}
      </Text>
    </Box>
  );
};

export default CreateCommunityModal;