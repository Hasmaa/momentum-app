import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  HStack,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
  Divider,
  Button,
  Icon,
  Progress,
  VStack,
  SimpleGrid,
  Tooltip
} from '@chakra-ui/react';
import { MdLabel, MdSettings } from 'react-icons/md';
import { Tag } from '../../types';
import { TagBadge } from './TagBadge';

export interface TagCount {
  tag: Tag;
  count: number;
  percentage: number;
}

interface TagsMetricsCardProps {
  tags: Tag[];
  tagCounts: TagCount[];
  onManageTagsClick: () => void;
  onTagClick?: (tag: Tag) => void;
}

export const TagsMetricsCard: React.FC<TagsMetricsCardProps> = ({
  tags,
  tagCounts,
  onManageTagsClick,
  onTagClick
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Sort tag counts by count (descending)
  const sortedTagCounts = useMemo(() => {
    return [...tagCounts].sort((a, b) => b.count - a.count);
  }, [tagCounts]);
  
  // Get the top 5 most used tags
  const topTags = useMemo(() => {
    return sortedTagCounts.slice(0, 5);
  }, [sortedTagCounts]);
  
  return (
    <Card 
      variant="outline" 
      borderColor={borderColor}
      bg={cardBg}
      boxShadow="sm"
    >
      <CardHeader pb={2}>
        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <Icon as={MdLabel} boxSize={5} color="blue.500" />
            <Heading size="md">Tags Overview</Heading>
          </HStack>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Icon as={MdSettings} />}
            onClick={onManageTagsClick}
          >
            Manage Tags
          </Button>
        </Flex>
      </CardHeader>
      <Divider />
      <CardBody>
        <Stack spacing={4}>
          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
            <Stat>
              <StatLabel>Total Tags</StatLabel>
              <StatNumber>{tags.length}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Tagged Tasks</StatLabel>
              <StatNumber>{tagCounts.reduce((sum, item) => sum + item.count, 0)}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Most Used Tag</StatLabel>
              <StatNumber>
                {sortedTagCounts.length > 0 ? (
                  <TagBadge 
                    tag={sortedTagCounts[0].tag} 
                    size="sm" 
                    onClick={() => onTagClick && onTagClick(sortedTagCounts[0].tag)}
                  />
                ) : (
                  '-'
                )}
              </StatNumber>
            </Stat>
          </SimpleGrid>
          
          <Box pt={2}>
            <Text fontWeight="medium" mb={2}>Top Tags Distribution</Text>
            {topTags.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {topTags.map((tagCount) => (
                  <Box key={tagCount.tag.id}>
                    <Flex justify="space-between" mb={1}>
                      <HStack>
                        <TagBadge 
                          tag={tagCount.tag} 
                          size="sm" 
                          onClick={() => onTagClick && onTagClick(tagCount.tag)}
                        />
                      </HStack>
                      <Tooltip label={`${tagCount.count} task(s) with this tag`}>
                        <Text fontSize="sm" fontWeight="medium">
                          {tagCount.count} ({Math.round(tagCount.percentage)}%)
                        </Text>
                      </Tooltip>
                    </Flex>
                    <Progress 
                      value={tagCount.percentage} 
                      size="sm" 
                      colorScheme={tagCount.tag.color.includes('#') ? undefined : tagCount.tag.color}
                      borderRadius="full"
                      bgColor="gray.100"
                    />
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text color="gray.500" textAlign="center" py={4}>
                No tags have been assigned to tasks yet.
              </Text>
            )}
          </Box>
          
          {topTags.length > 0 && sortedTagCounts.length > 5 && (
            <Text fontSize="sm" color="gray.500" textAlign="right">
              + {sortedTagCounts.length - 5} more tags
            </Text>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}; 