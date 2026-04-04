export interface Book {
  id: string
  title: string
  author: string
  year: number
  genre: string
  description: string
  coverGradient: string
  coverTextColor: string
  excerpt: string
  language: string
}

export const libraryBooks: Book[] = [
  {
    id: 'pride-and-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: 1813,
    genre: 'Classic Romance',
    description:
      'A witty tale of love, manners, and marriage in Regency-era England, following the spirited Elizabeth Bennet.',
    coverGradient: 'from-rose-400 to-pink-600',
    coverTextColor: 'text-white',
    language: 'English',
    excerpt: `It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"

Mr. Bennet replied that he had not.

"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."

Mr. Bennet made no answer.

"Do not you want to know who has taken it?" cried his wife impatiently.

"You want to tell me, and I have no objection to hearing it."

This was invitation enough. "Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week."

"What is his name?"

"Bingley."

"Is he married or single?"

"Oh! single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!"`,
  },
  {
    id: 'alice-in-wonderland',
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    year: 1865,
    genre: 'Fantasy',
    description:
      "Alice follows a White Rabbit down a rabbit hole into a world of whimsy, logic, and delightful nonsense.",
    coverGradient: 'from-violet-400 to-purple-600',
    coverTextColor: 'text-white',
    language: 'English',
    excerpt: `Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, "and what is the use of a book," thought Alice "without pictures or conversations?"

So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.

There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, "Oh dear! Oh dear! I shall be late!" (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.

In another moment down went Alice after it, never once considering how in the world she was to get out again.`,
  },
  {
    id: 'sherlock-holmes',
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    year: 1892,
    genre: 'Mystery',
    description:
      'The brilliant detective Sherlock Holmes solves baffling mysteries with his extraordinary powers of observation and deduction.',
    coverGradient: 'from-amber-500 to-orange-600',
    coverTextColor: 'text-white',
    language: 'English',
    excerpt: `To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind. He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position. He never spoke of the softer passions, save with a gibe and a sneer. They were admirable things for the observer—excellent for drawing the veil from men's motives and actions. But for the trained reasoner to admit such intrusions into his own delicate and finely adjusted temperament was to introduce a distracting factor which might throw a doubt upon all his mental results.

I had seen little of Holmes lately. My marriage had drifted us away from each other. My own complete happiness, and the home-centred interests which rise up around the man who first finds himself master of his own establishment, were sufficient to absorb all my attention, while Holmes, who loathed every form of society with his whole Bohemian soul, remained in our lodgings in Baker Street, buried among his old books, and alternating from week to week between cocaine and ambition, the drowsiness of the drug, and the fierce energy of his own keen nature.`,
  },
  {
    id: 'moby-dick',
    title: 'Moby-Dick',
    author: 'Herman Melville',
    year: 1851,
    genre: 'Adventure',
    description:
      "Captain Ahab's obsessive quest to hunt the white sperm whale that took his leg becomes an epic voyage into the heart of darkness.",
    coverGradient: 'from-blue-500 to-cyan-700',
    coverTextColor: 'text-white',
    language: 'English',
    excerpt: `Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people's hats off—then, I account it high time to get to sea as soon as I can.

There is nothing surprising in this. If they only knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me.

There now is your insular city of the Manhattoes, belted round by wharves as Indian isles by coral reefs—commerce surrounds it with her surf. Right and left, the streets take you waterward. Its extreme downtown is the Battery, where that noble mole is washed by waves, and cooled by breezes, which a few hours previous were out of sight of land. Look at the crowds of water-gazers there.`,
  },
  {
    id: 'frankenstein',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    year: 1818,
    genre: 'Gothic Horror',
    description:
      "The story of scientist Victor Frankenstein and his terrifying creation — a tale of ambition, isolation, and what it means to be human.",
    coverGradient: 'from-gray-700 to-slate-900',
    coverTextColor: 'text-white',
    language: 'English',
    excerpt: `You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday, and my first task is to assure my dear sister of my welfare and increasing confidence in the success of my undertaking.

I am already far north of London, and as I walk in the streets of Petersburgh, I feel a cold northern breeze play upon my cheeks, which braces my nerves and fills me with delight. Do you understand this feeling? This breeze, which has travelled from the regions towards which I am advancing, gives me a foretaste of those icy climes. Inspirited by this wind of promise, my daydreams become more fervent and vivid. I try in vain to be persuaded that the pole is the seat of frost and desolation; it ever presents itself to my imagination as the region of beauty and delight.

There—for with your leave, my sister, I will put some trust in preceding navigators—there snow and frost are banished; and, sailing over a calm sea, we may be wafted to a land surpassing in wonders and in beauty every region hitherto discovered on the habitable globe. Its productions and features may be without example, as the phenomena of the heavenly bodies undoubtedly are in those undiscovered solitudes.`,
  },
  {
    id: 'tale-of-two-cities',
    title: 'A Tale of Two Cities',
    author: 'Charles Dickens',
    year: 1859,
    genre: 'Historical Fiction',
    description:
      'Set against the French Revolution, this classic novel explores sacrifice, resurrection, and the duality of human nature.',
    coverGradient: 'from-red-500 to-rose-700',
    coverTextColor: 'text-white',
    language: 'English',
    excerpt: `It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair, we had everything before us, we had nothing before us, we were all going direct to Heaven, we were all going direct the other way—in short, the period was so far like the present period, that some of its noisiest authorities insisted on its being received, for good or for evil, in the superlative degree of comparison only.

There were a king with a large jaw and a queen with a plain face, on the throne of England; there were a king with a large jaw and a queen with a fair face, on the throne of France. In both countries it was clearer than crystal to the lords of the State preserves of loaves and fishes, that things in general were settled for ever.

It was the year of Our Lord one thousand seven hundred and seventy-five. Spiritual revelations were conceded to England at that favoured period, as at this. Mrs. Southcott had recently attained her five-and-twentieth blessed birthday, of whom a prophetic private in the Life Guards had heralded the sublime appearance by announcing that arrangements were made for the swallowing up of London and Westminster.`,
  },
  {
    id: 'treasure-island',
    title: 'Treasure Island',
    author: 'Robert Louis Stevenson',
    year: 1883,
    genre: 'Adventure',
    description:
      'Young Jim Hawkins discovers a treasure map and embarks on a swashbuckling adventure with pirates and buried gold.',
    coverGradient: 'from-teal-500 to-emerald-700',
    coverTextColor: 'text-white',
    language: 'English',
    excerpt: `Squire Trelawney, Dr. Livesey, and the rest of these gentlemen having asked me to write down the whole particulars about Treasure Island, from the beginning to the end, keeping nothing back but the bearings of the island, and that only because there is still treasure not yet lifted, I take up my pen in the year of grace 17— and go back to the time when my father kept the Admiral Benbow inn and the brown old seaman with the sabre cut first took up his lodging under our roof.

I remember him as if it were yesterday, as he came plodding to the inn door, his sea-chest following behind him in a hand-barrow—a tall, strong, heavy, nut-brown man, his tarry pigtail falling over the shoulder of his soiled blue coat, his hands ragged and scarred, with black, broken nails, and the sabre cut across one cheek, a dirty, livid white. I remember him looking round the cover and whistling to himself as he did so, and then breaking out in that old sea-song that he sang so often afterwards:

"Fifteen men on the dead man's chest—
Yo-ho-ho, and a bottle of rum!"`,
  },
  {
    id: 'little-women',
    title: 'Little Women',
    author: 'Louisa May Alcott',
    year: 1868,
    genre: 'Coming of Age',
    description:
      'The beloved story of the four March sisters — Meg, Jo, Beth, and Amy — growing up during the American Civil War.',
    coverGradient: 'from-yellow-400 to-amber-600',
    coverTextColor: 'text-white',
    language: 'English',
    excerpt: `"Christmas won't be Christmas without any presents," grumbled Jo, lying on the rug.

"It's so dreadful to be poor!" sighed Meg, looking down at her old dress.

"I don't think it's fair for some girls to have plenty of pretty things, and other girls nothing at all," added little Amy, with an injured sniff.

"We've got Father and Mother, and each other," said Beth contentedly from her corner.

The four young faces on which the firelight shone brightened at the cheerful words, but darkened again as Jo said sadly, "We haven't got Father, and shall not have him for a long time." She didn't say "perhaps never," but each silently added it, thinking of Father far away, where the fighting was.

"Now, Mother's coming!" cried Beth. And they all brightened when the door opened and a tall, motherly woman entered. She was not elegantly dressed, but a noble-looking woman, and the girls thought the gray cloak and unfashionable bonnet covered the most splendid mother in the world.

"Merry Christmas, little daughters! I'm glad you began at once, and hope you will keep on. But I want to say one word before we sit down. Not far away from here lies a poor woman with a little newborn baby. Six children are huddled into one bed to keep from freezing, for they have no fire. There is nothing to eat over there, and the oldest boy came to tell me they were suffering hunger and cold."`,
  },
]

export function getBookById(id: string): Book | undefined {
  return libraryBooks.find((b) => b.id === id)
}
