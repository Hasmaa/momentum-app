import { AddIcon, WarningIcon, CalendarIcon } from "@chakra-ui/icons";
import { Button, FocusLock, Grid, GridItem, Icon, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Textarea, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { TaskPriority, TaskStatus } from "../types";
import { getStatusIcon } from "./utils";

interface CreateTaskModalProps {
    isCreateModalOpen: boolean;
    onCreateModalClose: () => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    title: string;
    setTitle: (title: string) => void;
    description: string;
    setDescription: (description: string) => void;
    priority: TaskPriority;
    setPriority: (priority: TaskPriority) => void;
    status: TaskStatus;
    setStatus: (status: TaskStatus) => void;
    dueDate: string;
    setDueDate: (dueDate: string) => void;
    isSubmitting: boolean;
}

export const CreateTaskModal = ({
    isCreateModalOpen,
    onCreateModalClose,
    handleSubmit,
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    status,
    setStatus,
    dueDate,
    setDueDate,
    isSubmitting,
}: CreateTaskModalProps) => {
    return(
        <Modal 
          isOpen={isCreateModalOpen} 
          onClose={onCreateModalClose} 
          size="xl"
          motionPreset="slideInBottom"
        >
          <ModalOverlay 
            bg="blackAlpha.300"
            backdropFilter="blur(10px)"
          />
          <ModalContent
            as={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            style={{
              transition: 'all 0.3s ease-in-out'
            }}
          >
            <FocusLock>
              <form onSubmit={handleSubmit}>
                <ModalHeader>Create New Task</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack spacing={4}>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <AddIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="Task Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        variant="filled"
                        data-autofocus="true"
                        autoFocus
                      />
                    </InputGroup>
                    <Textarea
                      placeholder="Task Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      variant="filled"
                      rows={3}
                    />
                    <Grid templateColumns="repeat(2, 1fr)" gap={4} width="full">
                      <GridItem>
                        <Select 
                          value={priority} 
                          onChange={(e) => setPriority(e.target.value as TaskPriority)}
                          variant="filled"
                          icon={<WarningIcon />}
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </Select>
                      </GridItem>
                      <GridItem>
                        <Select 
                          value={status} 
                          onChange={(e) => setStatus(e.target.value as TaskStatus)}
                          variant="filled"
                          icon={<Icon as={getStatusIcon(status)} />}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </Select>
                      </GridItem>
                    </Grid>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <CalendarIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                        variant="filled"
                      />
                    </InputGroup>
                  </VStack>
                </ModalBody>
                <ModalFooter>
                  <Button 
                    variant="ghost" 
                    mr={3} 
                    onClick={onCreateModalClose}
                    isDisabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    colorScheme="blue" 
                    leftIcon={<AddIcon />}
                    isLoading={isSubmitting}
                    loadingText="Creating..."
                  >
                    Create Task
                  </Button>
                </ModalFooter>
              </form>
            </FocusLock>
          </ModalContent>
        </Modal>
        )
}