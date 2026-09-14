import { Anchor, Card, Container, List, ListItem, Stack, Text, Title } from "@mantine/core";
import { IconBooks } from "@tabler/icons-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "References" };

const REFERENCES: { text: string; href?: string }[] = [
  { text: "Baddeley, A. (1990). Human Memory. London: Lawrence Erlbaum Associates." },
  { text: "Begeny, J. C., & Greene, D. J. (2014). Can readability formulas be used to successfully gauge difficulty of reading materials? Psychology in the Schools, 51, 198–215.", href: "https://doi.org/10.1002/pits.21740" },
  { text: "Cobb, T. (2017). LexTutor (1998–2017).", href: "https://www.lextutor.ca/" },
  { text: "Coxhead, A. (2000). A new academic word list. TESOL Quarterly, 34, 213–238." },
  { text: "Dwyer, E., Ehsanzadeh, S.J., & Grigorescu, C. (submitted). Academic vocabulary in primary and secondary content area textbooks. Journal of English for Academic Purposes." },
  { text: "Wikibooks: Reading Levels.", href: "https://en.wikibooks.org/wiki/Wikibooks:Reading_Levels" },
  { text: "Dwyer, E., & Ehsanzadeh, S.J. (2016, September). The Teachers’ U.S. Corpus (TUSC). International Vocab@Tokyo Vocabulary Conference, Meiji Gakuin University, Tokyo, Japan." },
  { text: "Dwyer, E., & Ehsanzadeh, S.J. (2016, May). Academic language in K-12 context. Sunshine State TESOL Conference, West Palm Beach, Florida." },
  { text: "Dwyer, E., & Ehsanzadeh, S.J. (2016, October). Academic vocabulary: Then and now. 12th Annual MDTESOL/Bilingual Education Association Fall Symposium, Miami-Dade College, Miami, Florida." },
  { text: "Ehsanzadeh, S.J. (2012). Depth versus breadth of lexical repertoire: Assessing their role in EFL students’ incidental vocabulary acquisition. TESL Canada Journal, 29(2), 24–41." },
  { text: "Ehsanzadeh, S.J., & Dwyer, E. (2018, March). The Science and Math Academic Corpus for Kids (SMACK). Annual TESOL International Convention, Chicago, Illinois." },
  { text: "Ehsanzadeh, S.J., & Dwyer, E. (2017, March). Teachers’ U.S. Corpus: A new perspective. Annual TESOL International Convention, Seattle, Washington." },
  { text: "Ehsanzadeh, S.J., & Dwyer, E. (2016, October). A new academic word list for K-12 context. Southeast TESOL Regional Conference (SETESOL), Louisville, Kentucky." },
  { text: "Ehsanzadeh, S.J., Dwyer, E., & Carter, D. (2015, October). Situated language of mathematics. SETESOL and K-12 Dream Day, University of New Orleans, Louisiana." },
  { text: "Flesch, R. How to write plain English. University of Canterbury." },
  { text: "Gardner, D., & Davies, M. (2013). A new academic vocabulary list. Applied Linguistics, 35(3), 305–327." },
  { text: "Laufer, B. (2003). Vocabulary acquisition in a second language: Do learners really acquire most vocabulary by reading? Canadian Modern Language Review, 59(4), 567–587." },
  { text: "Nation, P. (2013). Learning Vocabulary in Another Language. Cambridge: Cambridge University Press." },
  { text: "Schunk, D. H. (2012). Learning Theories: An Educational Perspective. Pearson Education." },
  { text: "Tognini-Bonelli, E. (2001). Corpus Linguistics at Work. Amsterdam: John Benjamins." },
  { text: "West, M. (1953). A General Service List of English Words. London: Longman, Green." },
];

const TECHNOLOGY: { text: string; href: string }[] = [
  { text: "Wiktionary, the free dictionary", href: "https://en.wiktionary.org/" },
  { text: "Amazon Textract (image text extraction)", href: "https://aws.amazon.com/textract/" },
  { text: "Mantine UI", href: "https://mantine.dev/" },
  { text: "Next.js", href: "https://nextjs.org/" },
];

export default function ReferencesPage() {
  return (
    <Container size="md">
      <PageHeader title="References" description="The research and tools behind VIRS." icon={<IconBooks size={24} />} />
      <Stack gap="lg">
        <Card withBorder padding="lg">
          <Title order={4} mb="md">
            Research
          </Title>
          <List spacing="sm" size="sm">
            {REFERENCES.map((reference) => (
              <ListItem key={reference.text}>
                <Text size="sm">
                  {reference.text}{" "}
                  {reference.href && (
                    <Anchor href={reference.href} target="_blank" rel="noreferrer" size="sm">
                      Link
                    </Anchor>
                  )}
                </Text>
              </ListItem>
            ))}
          </List>
        </Card>
        <Card withBorder padding="lg">
          <Title order={4} mb="md">
            Technology
          </Title>
          <List spacing="sm" size="sm">
            {TECHNOLOGY.map((item) => (
              <ListItem key={item.href}>
                <Anchor href={item.href} target="_blank" rel="noreferrer" size="sm">
                  {item.text}
                </Anchor>
              </ListItem>
            ))}
          </List>
        </Card>
      </Stack>
    </Container>
  );
}
