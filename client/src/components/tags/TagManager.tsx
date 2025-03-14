import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Tooltip
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Tag } from '../../types';
import { TagService } from '../../services/TagService';
import { TagBadge } from './TagBadge';
import { TagColorPicker } from './TagColorPicker';

interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onTagsUpdated?: () => void;
}

export const TagManager: React.FC<TagManagerProps> = ({
  isOpen,
  onClose,
  onTagsUpdated
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TagService.getRandomColor());
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  
  const { isOpen: isDeleteDialogOpen, onOpen: onDeleteDialogOpen, onClose: onDeleteDialogClose } = useDisclosure();
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  
  // Load tags
  useEffect(() => {
    if (isOpen) {
      loadTags();
    }
  }, [isOpen]);
  
  // Load tags from storage
  const loadTags = () => {
    const loadedTags = TagService.getTags();
    setTags(loadedTags);
  };
  
  // Handle creating a new tag
  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      toast({
        title: 'Tag name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Check if tag with same name already exists
    if (tags.some(tag => tag.name.toLowerCase() === newTagName.toLowerCase())) {
      toast({
        title: 'Tag already exists',
        description: 'A tag with the same name already exists',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Create the new tag
    const newTag = TagService.createTag(newTagName, newTagColor);
    
    // Update the state
    setTags([...tags, newTag]);
    setNewTagName('');
    setNewTagColor(TagService.getRandomColor());
    
    toast({
      title: 'Tag created',
      description: `The tag "${newTag.name}" has been created`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    onTagsUpdated?.();
  };
  
  // Handle editing a tag
  const handleEditTag = (tag: Tag) => {
    setEditingTag({ ...tag });
    setIsEditing(true);
  };
  
  // Handle saving edited tag
  const handleSaveEdit = () => {
    if (!editingTag) return;
    
    if (!editingTag.name.trim()) {
      toast({
        title: 'Tag name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Check if another tag with the same name exists (excluding the current tag)
    if (tags.some(tag => tag.id !== editingTag.id && tag.name.toLowerCase() === editingTag.name.toLowerCase())) {
      toast({
        title: 'Tag name already exists',
        description: 'Another tag with the same name already exists',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Update the tag
    const updatedTag = TagService.updateTag(editingTag);
    
    // Update state
    setTags(tags.map(tag => tag.id === updatedTag.id ? updatedTag : tag));
    setIsEditing(false);
    setEditingTag(null);
    
    toast({
      title: 'Tag updated',
      description: `The tag "${updatedTag.name}" has been updated`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    onTagsUpdated?.();
  };
  
  // Handle tag deletion
  const handleDeleteClick = (tag: Tag) => {
    setTagToDelete(tag);
    onDeleteDialogOpen();
  };
  
  // Confirm tag deletion
  const confirmDeleteTag = () => {
    if (!tagToDelete) return;
    
    // Delete the tag
    TagService.deleteTag(tagToDelete.id);
    
    // Update state
    setTags(tags.filter(tag => tag.id !== tagToDelete.id));
    setTagToDelete(null);
    onDeleteDialogClose();
    
    toast({
      title: 'Tag deleted',
      description: `The tag "${tagToDelete.name}" has been deleted`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    onTagsUpdated?.();
  };
  
  // Cancel tag editing
  const cancelEdit = () => {
    setIsEditing(false);
    setEditingTag(null);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent bg={bgColor}>
        <ModalHeader>
          <Heading size="md">Tag Manager</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Create Tag Form */}
            <Box p={4} borderWidth="1px" borderRadius="md">
              <Heading size="sm" mb={4}>Create New Tag</Heading>
              <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                <FormControl>
                  <FormLabel fontSize="sm">Tag Name</FormLabel>
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Enter tag name"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Tag Color</FormLabel>
                  <TagColorPicker
                    selectedColor={newTagColor}
                    onColorSelect={setNewTagColor}
                  />
                </FormControl>
              </Flex>
              <Flex justify="flex-end" mt={4}>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  onClick={handleCreateTag}
                  isDisabled={!newTagName.trim()}
                >
                  Create Tag
                </Button>
              </Flex>
            </Box>
            
            {/* Tags Table */}
            <Box borderWidth="1px" borderRadius="md" overflow="hidden">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Tag</Th>
                    <Th>Color</Th>
                    <Th width="100px">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <Tr key={tag.id}>
                        <Td>
                          <TagBadge tag={tag} />
                        </Td>
                        <Td>
                          <Box
                            w="24px"
                            h="24px"
                            borderRadius="md"
                            bg={tag.color}
                            borderWidth="1px"
                            borderColor="gray.300"
                          />
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Tooltip label="Edit tag">
                              <IconButton
                                icon={<EditIcon />}
                                aria-label="Edit tag"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditTag(tag)}
                              />
                            </Tooltip>
                            <Tooltip label="Delete tag">
                              <IconButton
                                icon={<DeleteIcon />}
                                aria-label="Delete tag"
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeleteClick(tag)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={3} textAlign="center" py={4}>
                        <Text color="gray.500">No tags found. Create your first tag above.</Text>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
      
      {/* Edit Tag Modal */}
      <Modal isOpen={isEditing} onClose={cancelEdit} size="md">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent>
          <ModalHeader>Edit Tag</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingTag && (
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Tag Name</FormLabel>
                  <Input
                    value={editingTag.name}
                    onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Tag Color</FormLabel>
                  <TagColorPicker
                    selectedColor={editingTag.color}
                    onColorSelect={(color) => setEditingTag({ ...editingTag, color })}
                  />
                </FormControl>
                <Box>
                  <Text fontWeight="bold" mb={2}>Preview:</Text>
                  <TagBadge tag={editingTag} />
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={cancelEdit}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={onDeleteDialogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Tag
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete the tag "{tagToDelete?.name}"?
              {/* If tasks are using this tag, you'd want to warn the user here */}
              This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} onClick={onDeleteDialogClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDeleteTag} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Modal>
  );
}; 