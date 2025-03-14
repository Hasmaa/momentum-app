import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  HStack,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Text,
  VStack,
  Icon,
  InputGroup,
  InputLeftElement,
  Divider,
  Button,
  useDisclosure,
  useColorModeValue,
  Tag as ChakraTag,
  PopoverHeader,
  PopoverFooter,
  PopoverCloseButton
} from '@chakra-ui/react';
import { AddIcon, SearchIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { MdLabel } from 'react-icons/md';
import { Tag } from '../../types';
import { TagService } from '../../services/TagService';
import { TagBadge } from './TagBadge';
import { TagColorPicker } from './TagColorPicker';

interface TagsInputProps {
  selectedTags?: Tag[];
  onChange: (tags: Tag[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export const TagsInput: React.FC<TagsInputProps> = ({
  selectedTags = [],
  onChange,
  placeholder = 'Add tags...',
  maxTags = 10,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagColor, setNewTagColor] = useState(TagService.getRandomColor());
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Load available tags
  useEffect(() => {
    const tags = TagService.getTags();
    setAvailableTags(tags);
    setFilteredTags(tags.filter(tag => 
      !selectedTags.some(selected => selected.id === tag.id) &&
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
    ));
  }, [selectedTags, inputValue]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    // Filter available tags based on input
    const filtered = availableTags.filter(tag => 
      !selectedTags.some(selected => selected.id === tag.id) &&
      tag.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    
    setFilteredTags(filtered);
  };
  
  // Handle tag selection
  const handleTagSelect = (tag: Tag) => {
    if (selectedTags.length < maxTags) {
      const updatedTags = [...selectedTags, tag];
      onChange(updatedTags);
      setInputValue('');
    }
  };
  
  // Handle tag removal
  const handleTagRemove = (tagId: string) => {
    const updatedTags = selectedTags.filter(tag => tag.id !== tagId);
    onChange(updatedTags);
  };
  
  // Handle creating a new tag
  const handleCreateTag = () => {
    if (!inputValue.trim()) return;
    
    // Check if tag with same name already exists
    const existingTag = TagService.findTagByName(inputValue);
    
    if (existingTag) {
      if (!selectedTags.some(tag => tag.id === existingTag.id)) {
        handleTagSelect(existingTag);
      }
      setInputValue('');
      return;
    }
    
    if (isCreatingTag) {
      const newTag = TagService.createTag(inputValue, newTagColor);
      handleTagSelect(newTag);
      setIsCreatingTag(false);
      setInputValue('');
      setNewTagColor(TagService.getRandomColor());
    } else {
      setIsCreatingTag(true);
    }
  };
  
  // Handle pressing enter in the input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleCreateTag();
    } else if (e.key === 'Escape') {
      setIsCreatingTag(false);
      onClose();
    } else if (e.key === 'Backspace' && !inputValue) {
      // Remove the last tag if backspace is pressed on empty input
      if (selectedTags.length > 0) {
        const lastTag = selectedTags[selectedTags.length - 1];
        handleTagRemove(lastTag.id);
      }
    }
  };
  
  return (
    <Popover
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setIsCreatingTag(false);
      }}
      onOpen={onOpen}
      placement="bottom-start"
      gutter={4}
      closeOnBlur={!isCreatingTag}
    >
      <PopoverTrigger>
        <Box 
          borderWidth="1px"
          borderRadius="md"
          p={2}
          cursor="text"
          onClick={() => inputRef.current?.focus()}
          minH="60px"
          position="relative"
          w="100%"
        >
          <Flex flexWrap="wrap" alignItems="center">
            {selectedTags?.map((tag) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                isRemovable
                size="md"
                onRemove={() => handleTagRemove(tag.id)}
              />
            ))}
            <InputGroup size="md" width={inputValue ? 'auto' : '100%'} minW="150px">
              <InputLeftElement pointerEvents="none">
                <Icon as={MdLabel} color="gray.400" />
              </InputLeftElement>
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                placeholder={selectedTags.length === 0 ? placeholder : ''}
                border="none"
                _focus={{ boxShadow: 'none' }}
                onKeyDown={handleKeyDown}
              />
            </InputGroup>
          </Flex>
          {selectedTags.length >= maxTags && (
            <Text fontSize="xs" color="red.500" position="absolute" bottom="0" right="2">
              Maximum {maxTags} tags allowed
            </Text>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent 
        width="100%"
        shadow="lg"
        bg={bgColor}
        borderColor={borderColor}
        maxH="300px"
        overflowY="auto"
        zIndex={1000}
      >
        <PopoverCloseButton />
        {isCreatingTag ? (
          <>
            <PopoverHeader fontWeight="semibold">Create New Tag</PopoverHeader>
            <PopoverBody>
              <VStack spacing={3} align="stretch">
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={MdLabel} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Tag name"
                    autoFocus
                  />
                </InputGroup>
                <TagColorPicker 
                  selectedColor={newTagColor} 
                  onColorSelect={setNewTagColor} 
                />
                <ChakraTag
                  size="md"
                  borderRadius="full"
                  variant="solid"
                  backgroundColor={newTagColor}
                  color="white"
                  px={3}
                  alignSelf="center"
                >
                  {inputValue || 'Tag Preview'}
                </ChakraTag>
              </VStack>
            </PopoverBody>
            <PopoverFooter>
              <HStack spacing={2} justifyContent="flex-end">
                <Button
                  size="sm"
                  onClick={() => setIsCreatingTag(false)}
                  leftIcon={<SmallCloseIcon />}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleCreateTag}
                  leftIcon={<AddIcon />}
                  isDisabled={!inputValue.trim()}
                >
                  Create Tag
                </Button>
              </HStack>
            </PopoverFooter>
          </>
        ) : (
          <PopoverBody>
            <VStack spacing={2} align="stretch">
              <InputGroup>
                <InputLeftElement>
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search tags..."
                  value={inputValue}
                  onChange={handleInputChange}
                  autoFocus
                />
              </InputGroup>
              
              {filteredTags.length > 0 ? (
                <>
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mt={2}>
                    AVAILABLE TAGS
                  </Text>
                  <Box maxH="150px" overflowY="auto">
                    {filteredTags.map((tag) => (
                      <Box
                        key={tag.id}
                        cursor="pointer"
                        onClick={() => handleTagSelect(tag)}
                        p={2}
                        _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                        borderRadius="md"
                      >
                        <TagBadge tag={tag} />
                      </Box>
                    ))}
                  </Box>
                </>
              ) : inputValue.trim() ? (
                <Box textAlign="center" py={2}>
                  <Text fontSize="sm" color="gray.500">
                    No matching tags found
                  </Text>
                </Box>
              ) : null}

              {inputValue.trim() && (
                <>
                  <Divider my={2} />
                  <Box
                    cursor="pointer"
                    onClick={handleCreateTag}
                    p={2}
                    _hover={{ bg: useColorModeValue('blue.50', 'blue.900') }}
                    borderRadius="md"
                    textAlign="center"
                    color="blue.500"
                  >
                    <HStack spacing={2} justify="center">
                      <AddIcon />
                      <Text>Create "{inputValue}"</Text>
                    </HStack>
                  </Box>
                </>
              )}
            </VStack>
          </PopoverBody>
        )}
      </PopoverContent>
    </Popover>
  );
}; 