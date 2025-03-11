import React from 'react';
import {
  Box,
  Skeleton,
  SkeletonText,
  HStack,
  Card,
  CardBody,
  useColorModeValue,
} from '@chakra-ui/react';

const SkeletonCard = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <Card
      bg={cardBg}
      boxShadow="sm"
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      position="relative"
      overflow="visible"
      width="100%"
      mb={4}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        bottom={0}
        width="4px"
        borderTopLeftRadius="xl"
        borderBottomLeftRadius="xl"
        bg="gray.200"
      />
      <CardBody py={4} pl={6}>
        <Box>
          <HStack justify="space-between" mb={4}>
            <Skeleton height="20px" width="200px" />
            <HStack spacing={2}>
              <Skeleton height="32px" width="32px" borderRadius="md" />
              <Skeleton height="32px" width="32px" borderRadius="md" />
              <Skeleton height="32px" width="32px" borderRadius="md" />
            </HStack>
          </HStack>
          <SkeletonText mt={4} noOfLines={2} spacing={4} skeletonHeight="3" />
          <HStack mt={6} justify="space-between">
            <Skeleton height="20px" width="80px" borderRadius="full" />
            <Skeleton height="20px" width="100px" borderRadius="full" />
          </HStack>
        </Box>
      </CardBody>
    </Card>
  );
};

export default SkeletonCard; 