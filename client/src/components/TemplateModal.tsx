import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  Heading,
  Text,
  Icon,
  useColorModeValue,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  Badge,
  Divider,
  Button,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskTemplate, getCategoryInfo } from '../types/template';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: TaskTemplate[];
  onSelectTemplate: (template: TaskTemplate) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSelectTemplate,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const modalBg = useColorModeValue('gray.50', 'gray.900');
  const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.200');
  const badgeBg = useColorModeValue('gray.200', 'whiteAlpha.200');

  // Group templates by category
  const categories = Array.from(new Set(templates.map(t => t.category)));
  const templatesByCategory = categories.reduce((acc, category) => {
    acc[category] = templates.filter(t => t.category === category);
    return acc;
  }, {} as Record<string, TaskTemplate[]>);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay
        bg={useColorModeValue('blackAlpha.200', 'blackAlpha.700')}
        backdropFilter="blur(8px)"
      />
      <ModalContent
        as={motion.div}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        maxH="85vh"
        display="flex"
        flexDirection="column"
        bg={modalBg}
      >
        <ModalHeader 
          borderBottomWidth="1px" 
          borderBottomColor={borderColor}
          bg={modalBg}
          position="sticky"
          top={0}
          zIndex={2}
          pb={3}
        >
          <HStack spacing={2}>
            <Text fontSize="xl">✨</Text>
            <Text fontSize="xl" fontWeight="bold" color={headingColor}>Choose a Template</Text>
          </HStack>
          <Text color={textColor} fontSize="sm" mt={1}>
            Streamline your workflow with our curated templates
          </Text>
        </ModalHeader>
        <ModalCloseButton zIndex={3} />
        <ModalBody p={0} overflowY="auto" flex="1">
          <Tabs variant="unstyled" colorScheme="blue" display="flex" flexDirection="column" height="100%">
            <Box 
              position="sticky" 
              top={0} 
              bg={modalBg}
              borderBottomWidth="1px"
              borderColor={borderColor}
              px={4}
              pt={2}
              pb={0}
              zIndex={1}
            >
              <TabList 
                display="flex"
                width="100%"
                justifyContent="stretch"
                gap={1}
              >
                {categories.map(category => {
                  const info = getCategoryInfo(category);
                  return (
                    <Tab
                      key={category}
                      py={2}
                      px={2.5}
                      flex={1}
                      borderRadius="md"
                      transition="all 0.2s"
                      bg="transparent"
                      _selected={{ 
                        bg: hoverBg,
                        color: headingColor,
                      }}
                      _hover={{
                        bg: hoverBg,
                      }}
                      color={textColor}
                    >
                      <HStack width="100%" justify="space-between" align="center" spacing={2}>
                        <HStack spacing={2} flex={1} minW={0}>
                          <Box 
                            fontSize="md" 
                            width="20px" 
                            height="20px" 
                            display="flex" 
                            alignItems="center" 
                            justifyContent="center"
                          >
                            {info.icon}
                          </Box>
                          <Text 
                            fontWeight="medium" 
                            fontSize="sm"
                            isTruncated
                          >
                            {info.name}
                          </Text>
                        </HStack>
                        <Badge 
                          bg={badgeBg}
                          color={headingColor}
                          fontSize="2xs"
                          px={1.5}
                          py={0.5}
                          borderRadius="full"
                          minW="1.5rem"
                          textAlign="center"
                        >
                          {templatesByCategory[category].length}
                        </Badge>
                      </HStack>
                    </Tab>
                  );
                })}
              </TabList>
            </Box>
            <Box flex="1" px={6} py={6}>
              <TabPanels>
                {categories.map(category => {
                  const info = getCategoryInfo(category);
                  return (
                    <TabPanel key={category} p={0}>
                      <VStack align="stretch" spacing={6}>
                        <Text fontSize="sm" color={textColor} lineHeight="tall">
                          {info.description}
                        </Text>
                        <SimpleGrid columns={2} spacing={6}>
                          {templatesByCategory[category].map((template) => (
                            <MotionCard
                              key={template.id}
                              bg={cardBg}
                              borderWidth="1px"
                              borderColor={borderColor}
                              borderRadius="xl"
                              cursor="pointer"
                              whileHover={{ 
                                scale: 1.02,
                                boxShadow: "lg"
                              }}
                              whileTap={{ scale: 0.98 }}
                              _hover={{ bg: hoverBg }}
                              position="relative"
                              overflow="hidden"
                              onClick={() => onSelectTemplate(template)}
                              role="button"
                              tabIndex={0}
                              _focus={{
                                boxShadow: "outline",
                                outline: "none"
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  onSelectTemplate(template);
                                }
                              }}
                            >
                              <CardBody p={4}>
                                <VStack align="start" spacing={3}>
                                  <HStack spacing={3} width="100%" justify="space-between">
                                    <HStack spacing={3}>
                                      <Box fontSize="xl">{template.icon}</Box>
                                      <Heading size="sm" color={headingColor}>{template.name}</Heading>
                                    </HStack>
                                    <Badge
                                      bg={badgeBg}
                                      color={headingColor}
                                      fontSize="xs"
                                      px={2}
                                      py={0.5}
                                      borderRadius="full"
                                    >
                                      {template.tasks.length} TASKS
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="sm" color={textColor} lineHeight="tall" noOfLines={2}>
                                    {template.description}
                                  </Text>
                                  <Box width="100%">
                                    <Text fontSize="sm" fontWeight="medium" color={headingColor} mb={2}>
                                      Quick overview:
                                    </Text>
                                    <VStack align="start" spacing={1}>
                                      {template.tasks.slice(0, 3).map((task, index) => (
                                        <HStack key={index} spacing={2} align="start">
                                          <Text fontSize="xs" color={textColor}>•</Text>
                                          <Text fontSize="sm" color={textColor} noOfLines={1}>
                                            {task.title}
                                          </Text>
                                        </HStack>
                                      ))}
                                      {template.tasks.length > 3 && (
                                        <Text fontSize="sm" color={textColor} fontStyle="italic">
                                          +{template.tasks.length - 3} more tasks
                                        </Text>
                                      )}
                                    </VStack>
                                  </Box>
                                  <Button
                                    colorScheme="blue"
                                    size="sm"
                                    width="100%"
                                    borderRadius="md"
                                    fontWeight="medium"
                                    mt={1}
                                    pointerEvents="none"
                                    opacity={0.9}
                                    _hover={{ opacity: 0.9 }}
                                  >
                                    Use Template
                                  </Button>
                                </VStack>
                              </CardBody>
                            </MotionCard>
                          ))}
                        </SimpleGrid>
                      </VStack>
                    </TabPanel>
                  );
                })}
              </TabPanels>
            </Box>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TemplateModal; 