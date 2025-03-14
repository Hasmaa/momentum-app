import { WarningIcon, CalendarIcon } from '@chakra-ui/icons';
import { useColorModeValue, Card, Box, CardBody, VStack, Heading, Text, Flex, HStack, Tag as ChakraTag, TagLeftIcon, TagLabel, Wrap, WrapItem } from '@chakra-ui/react';
import { isPast, isWithinInterval, addDays, format } from 'date-fns';
import React from 'react';
import { Task } from '../types';
import { TagBadge } from '../components/tags/TagBadge';

// Add a DragOverlayCard component for better drag visuals
export const DragOverlayCard = ({ todo }: { todo: Task; }) => {
  const statusColors = {
    pending: 'gray',
    'in-progress': 'blue',
    completed: 'green'
  };

  const priorityColors = {
    low: 'green',
    medium: 'yellow',
    high: 'red'
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const descriptionColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  const isOverdue = isPast(new Date(todo.dueDate));
  const isDueSoon = isWithinInterval(new Date(todo.dueDate), {
    start: new Date(),
    end: addDays(new Date(), 2)
  });

  return (
    <Card
      bg={cardBg}
      boxShadow="2xl"
      borderRadius="xl"
      opacity={0.9}
      transform="scale(1.05) rotate(-1deg)"
      borderWidth="1px"
      borderColor={borderColor}
      position="relative"
      overflow="visible"
      width="100%"
      transition="all 0.15s"
      cursor="grabbing"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        bottom={0}
        width="4px"
        borderTopLeftRadius="xl"
        borderBottomLeftRadius="xl"
        bg={`${statusColors[todo.status]}.400`} />
      <CardBody py={4} pl={6}>
        <VStack spacing={4} align="stretch">
          <Heading size="sm" noOfLines={1}>
            {todo.title}
          </Heading>
          {todo.description && (
            <Text
              fontSize="sm"
              color={descriptionColor}
              noOfLines={2}
              lineHeight="tall"
            >
              {todo.description}
            </Text>
          )}

          {/* Task Tags Section */}
          {todo.tags && todo.tags.length > 0 && (
            <Wrap spacing={1} mt={2} mb={1}>
              {todo.tags.map(tag => (
                <WrapItem key={tag.id}>
                  <TagBadge tag={tag} size="sm" />
                </WrapItem>
              ))}
            </Wrap>
          )}
          
          <Flex
            justify="space-between"
            align="center"
            wrap="wrap"
            gap={2}
          >
            <HStack spacing={2}>
              <ChakraTag
                size="sm"
                colorScheme={priorityColors[todo.priority]}
                variant="subtle"
                borderRadius="full"
                px={3}
              >
                <TagLeftIcon
                  as={WarningIcon}
                  boxSize="10px" />
                <TagLabel textTransform="capitalize">
                  {todo.priority}
                </TagLabel>
              </ChakraTag>
            </HStack>
            <ChakraTag
              size="sm"
              variant="subtle"
              colorScheme={isOverdue ? 'red' : isDueSoon ? 'orange' : 'gray'}
              borderRadius="full"
              px={3}
            >
              <TagLeftIcon
                as={CalendarIcon}
                boxSize="10px" />
              <TagLabel>
                {format(new Date(todo.dueDate), 'MMM d')}
              </TagLabel>
            </ChakraTag>
          </Flex>
        </VStack>
      </CardBody>
    </Card>
  );
};
