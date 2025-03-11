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
              px={6}
              pt={2}
              pb={0}
              zIndex={1}
            >
              <TabList 
                display="flex"
                width="100%"
                justifyContent="stretch"
                gap={2}
              >
                {categories.map(category => {
                  const info = getCategoryInfo(category);
                  return (
                    <Tab
                      key={category}
                      py={3}
                      px={4}
                      flex={1}
                      borderRadius="lg"
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
                      <HStack spacing={2}>
                        <Text fontSize="lg">{info.icon}</Text>
                        <Text fontWeight="medium">{info.name}</Text>
                        <Badge 
                          bg={badgeBg}
                          color={headingColor}
                          fontSize="xs"
                          px={2}
                          py={0.5}
                          borderRadius="full"
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
                            >
                              <CardBody p={6}>
                                <VStack align="start" spacing={4}>
                                  <HStack spacing={3} width="100%" justify="space-between">
                                    <Box fontSize="2xl">{template.icon}</Box>
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
                                  <VStack align="start" spacing={2}>
                                    <Heading size="md" color={headingColor}>{template.name}</Heading>
                                    <Text fontSize="sm" color={textColor} lineHeight="tall">
                                      {template.description}
                                    </Text>
                                  </VStack>
                                  <VStack align="stretch" spacing={4} width="100%">
                                    <Divider borderColor={borderColor} />
                                    <Text fontSize="sm" fontWeight="medium" color={headingColor}>
                                      Tasks included:
                                    </Text>
                                    {template.tasks.map((task, index) => (
                                      <HStack key={index} spacing={3} align="start">
                                        <Text fontSize="sm" color={textColor} pt={1}>
                                          {index + 1}.
                                        </Text>
                                        <VStack align="start" spacing={1}>
                                          <Text fontSize="sm" fontWeight="medium" color={headingColor}>
                                            {task.title}
                                          </Text>
                                          {task.description && (
                                            <Text fontSize="sm" color={textColor} lineHeight="tall">
                                              {task.description}
                                            </Text>
                                          )}
                                        </VStack>
                                      </HStack>
                                    ))}
                                    <Button
                                      colorScheme="blue"
                                      size="md"
                                      width="100%"
                                      onClick={() => onSelectTemplate(template)}
                                      borderRadius="lg"
                                      fontWeight="medium"
                                    >
                                      Use This Template
                                    </Button>
                                  </VStack>
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