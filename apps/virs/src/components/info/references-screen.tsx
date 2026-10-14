import { Anchor, List, ListItem, Stack, Text } from "@mantine/core";
import { Marker, PageHeader, Section, Surface } from "@/components/ui";

// The research list from the original Cite Us / Reference page, in its order.
const RESEARCH: { text: string; href?: string; link?: string }[] = [
  { text: "Baddeley, A. (1990). Human Memory. London: Lawrence Erlbaum Associates." },
  { text: "Begeny, J. C., & Greene, D. J. (2014). Can readability formulas be used to successfully gauge difficulty of reading materials? Psychology in the Schools, 51, 198–215.", href: "https://doi.org/10.1002/pits.21740", link: "doi:10.1002/pits.21740" },
  { text: "Cobb, T. (2017). LexTutor (1998–2017).", href: "https://www.lextutor.ca/", link: "lextutor.ca" },
  { text: "Coxhead, A. (2000). A new academic word list. TESOL Quarterly, 34, 213–238." },
  { text: "Dwyer, E., Ehsanzadeh, S.J., & Grigorescu, C. (submitted for publication). Academic vocabulary in primary and secondary content area textbooks. Journal of English for Academic Purposes." },
  { text: "Wikibooks: Reading Levels.", href: "https://en.wikibooks.org/wiki/Wikibooks:Reading_Levels", link: "wikibooks.org" },
  { text: "Dwyer, E., & Ehsanzadeh, S.J. (2016, September). The Teachers’ U.S. Corpus (TUSC). Paper presented at the International Vocab@Tokyo Vocabulary Conference, Meiji Gakuin University, Tokyo, Japan." },
  { text: "Dwyer, E., & Ehsanzadeh, S.J. (2016, May). Academic language in K-12 context. Paper presented at the Sunshine State TESOL Conference, West Palm Beach, Florida." },
  { text: "Dwyer, E., & Ehsanzadeh, S.J. (2016, October). Academic vocabulary: Then and now. 12th Annual MDTESOL/Bilingual Education Association Fall Symposium, MDC InterAmerican, Miami-Dade College, Miami, Florida." },
  { text: "Ehsanzadeh, S.J. (2012). Depth versus breadth of lexical repertoire: Assessing their role in EFL students’ incidental vocabulary acquisition. TESL Canada Journal, 29(2), 24–41." },
  { text: "Ehsanzadeh, S.J., & Dwyer, E. (2018, March). The Science and Math Academic Corpus for Kids (SMACK). Paper presented at the Annual TESOL International Convention and English Language Expo, Chicago, Illinois." },
  { text: "Ehsanzadeh, S.J., & Dwyer, E. (2017, March). Teachers’ U.S. Corpus: A new perspective. Paper presented at the Annual TESOL International Convention and English Language Expo, Seattle, Washington." },
  { text: "Ehsanzadeh, S.J., & Dwyer, E. (2016, October). A new academic word list for K-12 context. Paper presented at the Annual Southeast TESOL Regional Conference (SETESOL), Louisville, Kentucky." },
  { text: "Ehsanzadeh, S.J., Dwyer, E., & Carter, D. (2015, October). Situated language of mathematics. Paper presented at SETESOL and K-12 Dream Day, University of New Orleans, Louisiana." },
  { text: "Flesch, R. How to write plain English. University of Canterbury, New Zealand." },
  { text: "Gardner, D., & Davies, M. (2013). A new academic vocabulary list. Applied Linguistics, 35(3), 305–327." },
  { text: "Laufer, B. (2003). Vocabulary acquisition in a second language: Do learners really acquire most vocabulary by reading? Some empirical evidence. Canadian Modern Language Review, 59(4), 567–587." },
  { text: "Nation, P. (2013). Learning Vocabulary in Another Language. Cambridge: Cambridge University Press." },
  { text: "Schunk, D. H. (2012). Learning Theories: An Educational Perspective. Pearson Education." },
  { text: "Tognini-Bonelli, E. (2001). Corpus Linguistics at Work. Amsterdam: John Benjamins." },
  { text: "West, M. (1953). A General Service List of English Words. London: Longman, Green." },
];

// What VIRS runs on today. (The old list also credited OpenCV and two image-cleanup papers used by
// the retired server-side photo reader; photos are now read in the browser with Tesseract.)
const TECHNOLOGY: { text: string; href: string; link: string }[] = [
  { text: "Tesseract OCR, which reads the text in uploaded photos (as tesseract.js, in the browser).", href: "https://github.com/tesseract-ocr/tesseract", link: "github.com/tesseract-ocr" },
  { text: "Wiktionary, the free dictionary, for word definitions.", href: "https://en.wiktionary.org/", link: "wiktionary.org" },
];

function Entries({ items }: { items: { text: string; href?: string; link?: string }[] }) {
  return (
    <List spacing="sm" size="sm" listStyleType="disc">
      {items.map((item) => (
        <ListItem key={item.text}>
          <Text size="sm" span>
            {item.text}{" "}
            {item.href && (
              <Anchor href={item.href} target="_blank" rel="noreferrer" inherit>
                {item.link}
              </Anchor>
            )}
          </Text>
        </ListItem>
      ))}
    </List>
  );
}

export function ReferencesScreen() {
  return (
    <Stack gap="xl">
      <PageHeader
        title={
          <>
            <Marker>References</Marker>
          </>
        }
        description="The research and tools behind VIRS. To cite VIRS itself: Ehsanzadeh, S.J. & Dwyer, E. (2017). A Corpus-based K-12 School Dictionary."
      />
      <Section title="Research">
        <Surface>
          <Entries items={RESEARCH} />
        </Surface>
      </Section>
      <Section title="Technology">
        <Surface>
          <Entries items={TECHNOLOGY} />
        </Surface>
      </Section>
    </Stack>
  );
}
