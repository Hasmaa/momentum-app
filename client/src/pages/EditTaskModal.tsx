import { Button, FocusLock, Grid, GridItem, Icon, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Textarea, VStack, Divider, Text } from "@chakra-ui/react";
import { Task, TaskPriority, TaskStatus } from "../types";
import { getStatusIcon } from "./utils";
import { EditIcon, WarningIcon, CalendarIcon, CheckIcon  } from "@chakra-ui/icons";
import { TagsInput } from "../components/tags";
import { MdLabel } from "react-icons/md";

interface EditTaskModalProps {
    isEditModalOpen: boolean;
    onEditModalClose: () => void;
    handleEdit: (task: Task) => void;
    editingTodo: Task | null;
    setEditingTodo: (task: Task | null) => void;
    isSubmitting: boolean;
}

export const EditTaskModal = ({
    isEditModalOpen,
    onEditModalClose,
    handleEdit,
    editingTodo,
    setEditingTodo,
    isSubmitting,
}: EditTaskModalProps) => {
    return (
        <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="xl">
            <ModalOverlay 
        bg="blackAlpha.300"
        backdropFilter="blur(10px)"
      />
      <ModalContent>
        {editingTodo && (
          <FocusLock>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEdit(editingTodo);
            }}>
              <ModalHeader>Edit Task</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <EditIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      value={editingTodo.title}
                      onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                      variant="filled"
                      size="lg"
                      fontWeight="bold"
                      data-autofocus="true"
                      autoFocus
                      required
                    />
                  </InputGroup>
                  <Textarea
                    value={editingTodo.description}
                    onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                    variant="filled"
                    rows={3}
                    placeholder="Task Description"
                  />
                  <Grid templateColumns="repeat(2, 1fr)" gap={4} width="full">
                    <GridItem>
                      <Select
                        value={editingTodo.priority}
                        onChange={(e) => setEditingTodo({ ...editingTodo, priority: e.target.value as TaskPriority })}
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
                        value={editingTodo.status}
                        onChange={(e) => setEditingTodo({ ...editingTodo, status: e.target.value as TaskStatus })}
                        variant="filled"
                        icon={<Icon as={getStatusIcon(editingTodo.status)} />}
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
                      value={new Date(editingTodo.dueDate).toISOString().split('T')[0]}
                      onChange={(e) => setEditingTodo({ ...editingTodo, dueDate: new Date(e.target.value).toISOString() })}
                      variant="filled"
                      required
                    />
                  </InputGroup>
                  
                  <Divider />
                  
                  <VStack align="flex-start" width="full" spacing={1}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.600">
                      <Icon as={MdLabel} mr={1} />
                      Tags
                    </Text>
                    <TagsInput
                      selectedTags={editingTodo.tags || []}
                      onChange={(tags) => setEditingTodo({ ...editingTodo, tags })}
                      placeholder="Add tags to your task..."
                      maxTags={10}
                    />
                  </VStack>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant="ghost" 
                  mr={3} 
                  onClick={onEditModalClose}
                  isDisabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  colorScheme="blue"
                  leftIcon={<CheckIcon />}
                  isLoading={isSubmitting}
                  loadingText="Saving..."
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </form>
          </FocusLock>
        )}
      </ModalContent>
    </Modal>
        )
}