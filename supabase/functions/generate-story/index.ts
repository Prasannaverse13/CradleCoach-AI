import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { childName, childAge, toy, generateAudio } = await req.json();

    if (!toy) {
      return new Response(
        JSON.stringify({ error: 'Toy description is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const ageDescription = childAge < 1 ? 'baby' : childAge === 1 ? 'toddler' : `${childAge}-year-old`;
    const story = generateStory(childName, ageDescription, toy);

    let audioUrl = null;
    let musicUrl = null;

    if (generateAudio && GEMINI_API_KEY) {
      console.log('Generating audio with Gemini API...');
      try {
        const [audio, music] = await Promise.all([
          generateSpeech(story, childName),
          generateMusic(toy)
        ]);
        audioUrl = audio;
        musicUrl = music;
        console.log('Audio generated successfully');
      } catch (error) {
        console.error('Audio generation error:', error);
      }
    } else {
      console.log('Audio generation skipped. Key available:', !!GEMINI_API_KEY);
    }

    return new Response(
      JSON.stringify({ story, audioUrl, musicUrl }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Story generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate story' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function generateSpeech(text: string, childName: string): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    console.log('No API key for speech generation');
    return null;
  }

  try {
    console.log('Calling Gemini API for speech...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Narrate this bedtime story in a warm, gentle voice suitable for reading to young children. Use a soothing tone and pace appropriate for bedtime:\n\n${text}`
            }]
          }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Puck'
                }
              }
            }
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Speech API error:', response.status, errorText);
      throw new Error(`Speech generation failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const audioData = data.candidates[0].content.parts[0].inlineData.data;
      console.log('Speech generated successfully');
      return `data:audio/mp3;base64,${audioData}`;
    }

    console.log('No audio data in response');
    return null;
  } catch (error) {
    console.error('Speech generation error:', error);
    return null;
  }
}

async function generateMusic(toy: string): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    console.log('No API key for music generation');
    return null;
  }

  try {
    console.log('Calling Gemini API for music...');
    const musicPrompt = `Create gentle, soothing lullaby background music for a children's bedtime story about ${toy}. Make it calming and peaceful, perfect for helping a child fall asleep. Use soft instruments like piano, strings, and gentle chimes.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: musicPrompt
            }]
          }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Puck'
                }
              }
            }
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Music API error:', response.status, errorText);
      throw new Error(`Music generation failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const musicData = data.candidates[0].content.parts[0].inlineData.data;
      console.log('Music generated successfully');
      return `data:audio/mp3;base64,${musicData}`;
    }

    console.log('No music data in response');
    return null;
  } catch (error) {
    console.error('Music generation error:', error);
    return null;
  }
}

function generateStory(childName: string, ageDescription: string, toy: string): string {
  const toyLower = toy.toLowerCase();
  
  const templates = [
    {
      condition: () => toyLower.includes('truck') || toyLower.includes('car') || toyLower.includes('vehicle'),
      story: `Once upon a time, in a cozy little garage at the very edge of Dreamland, there lived a very special ${toy}. This wasn't just any ordinary toy it had a secret. Every single night, when ${childName} closed their eyes and drifted off to sleep, something magical would happen. The ${toy} would come alive, its lights would twinkle like tiny stars, and it would set off on the most wonderful adventures!\n\nOne beautiful starry night, as the moon shone bright and round in the sky, the ${toy} had a brilliant idea. \"Tonight,\" it said to itself, \"I'm going to visit the Moon!\" And so, the ${toy} rolled out of the garage and looked up at the glowing moon hanging in the dark velvet sky.\n\nJust then, something amazing appeared a shimmering rainbow bridge that sparkled with all the colors you could ever imagine: red, orange, yellow, green, blue, indigo, and violet! The rainbow bridge stretched all the way from the ground up to the Moon itself. The ${toy} took a deep breath and started driving up the magical bridge. As it climbed higher and higher, it could see the whole world below getting smaller and smaller.\n\nAlong the way up the rainbow bridge, the ${toy} met the most wonderful friends. There were fluffy cloud animals soft, white bunnies that hopped from cloud to cloud, gentle cloud puppies with wagging tails made of mist, and even cloud birds that sang the sweetest melodies. They all waved their cloudy paws and wings at the ${toy}, calling out, \"Hello! Where are you going?\" The ${toy} honked its horn happily and called back, \"I'm going to visit the Moon!\"\n\nThe cloud friends were so excited that they decided to join the adventure! Together, they all traveled up the rainbow bridge, laughing and playing games as they went. The cloud bunny taught the ${toy} how to hop like a bunny, and the cloud puppy showed it how to do a silly spin. They were having so much fun!\n\nFinally, after what seemed like both a very long time and no time at all, they reached the top of the rainbow bridge and landed right on the Moon! And oh, what a surprise was waiting for them there! The Moon wasn't hard and rocky like they expected. No, the Moon was made of the softest, most wonderful cheese you could ever imagine fluffy, creamy, and absolutely perfect for resting on.\n\nThe ${toy} and its new cloud friends bounced gently on the cheese surface, giggling with delight. \"This is amazing!\" exclaimed the ${toy}. Just then, they heard a gentle rustling sound. Out from behind a moon crater hopped the Moon Bunnies a whole family of silvery-white rabbits with long, floppy ears and the kindest eyes you've ever seen.\n\n\"Welcome to the Moon!\" said the oldest Moon Bunny, whose name was Luna. \"We've been waiting for visitors! Would you like to play with us?\" The ${toy} was so happy it could hardly speak, but it managed to say, \"Yes, please! We'd love to!\"\n\nAnd so began the most magical playtime ever. The Moon Bunnies took the ${toy} and the cloud friends on a grand tour of the Moon. They played the most wonderful game of hide and seek, ducking behind craters and peeking out from behind moon rocks. The ${toy} found the best hiding spots, tucking itself into little moon valleys where the shadows were deep and cozy.\n\nThen, the Moon Bunnies taught everyone how to dance the Moonbeam Dance. They held hands (and paws, and wheels!) and danced in a big circle, spinning and twirling to the music of the twinkling stars. Each star played a different note, like a giant orchestra in the sky, and together they made the most beautiful lullaby.\n\nAs they danced, something even more magical happened. The stars began to come closer, curious about all the fun. They swirled around the dancers, leaving trails of sparkly stardust in the air. The ${toy} drove in loops and circles, making pretty patterns with the stardust. It was like painting pictures in the sky!\n\nAfter dancing until they were happily tired, the Moon Bunnies invited everyone to sit down for a special moon picnic. They brought out moon cookies (which tasted like vanilla and dreams), star-juice (which was fizzy and made you feel light as a feather), and pieces of the most delicious moon cheese. They all sat together, sharing stories and laughing at the cloud puppy's silly jokes.\n\nLuna, the oldest Moon Bunny, looked at the ${toy} with her wise, kind eyes and said, \"You know, little ${toy}, you are very brave to come all this way to visit us. And your friend ${childName} is very special too. We Moon Bunnies can see into children's hearts, and ${childName} has the kindest, most wonderful heart. You must take very good care of each other.\"\n\nThe ${toy} felt warm and happy inside. \"I promise,\" it said solemnly. \"${childName} is my best friend in the whole world, and I'll always be there for them.\"\n\nAs the night went on, the ${toy} noticed that the sky was beginning to change colors. Soft pinks and oranges were starting to appear at the edge of the horizon it was almost morning back on Earth! The ${toy} knew it was time to go home so it would be there when ${childName} woke up.\n\nThe Moon Bunnies and cloud friends gathered around to say goodbye. Luna gave the ${toy} a special gift a small, glowing moon stone. \"Keep this with you always,\" she said. \"Whenever ${childName} feels scared or lonely, this moon stone will remind them that they have friends on the Moon who love them very much.\"\n\nWith tears of happiness in its headlights, the ${toy} thanked all its new friends. The cloud animals lined up to make a soft, fluffy slide back down to the rainbow bridge. \"Wheee!\" cried the ${toy} as it slid down the clouds, bouncing gently from one fluffy cloud to another.\n\nWhen it reached the rainbow bridge, the ${toy} paused to look back one more time. All the Moon Bunnies were waving, and the stars were twinkling extra bright, like they were winking goodbye. The ${toy} honked its horn three times \"Beep! Beep! Beep!\" which meant \"Thank you! I love you! See you again soon!\"\n\nThen, the ${toy} zoomed down the rainbow bridge, going faster and faster. The colors of the rainbow blurred together, creating the most beautiful light show. As it got closer to home, the ${toy} could see ${childName}'s house, with a warm, welcoming light in the window.\n\nThe ${toy} rolled back into the garage just as the first rays of morning sun were peeking over the horizon. It parked itself in exactly the same spot where it had been before the adventure. The moon stone that Luna had given it began to glow softly, and then, in a shimmer of magic, it became part of the ${toy} itself now, whenever ${childName} played with the ${toy}, they would feel that special love and bravery from the Moon.\n\nAs the ${toy} settled into stillness, it smiled to itself (yes, toys can smile, especially magical ones!). It was already looking forward to tonight's adventure. Maybe they would visit the Cloud Kingdom, or perhaps dive down to the Ocean of Dreams. Wherever they went, the ${toy} knew it would be wonderful, because the best part of any adventure was bringing back joy and sweet dreams for its best friend, ${childName}.\n\nAnd so, as ${childName} began to wake up, stretching and yawning in the warm morning light, the ${toy} was right there, waiting patiently. If ${childName} looked very, very closely, they might notice a tiny sparkle on the ${toy}, a little bit of moon dust left over from the night's adventure.\n\nFrom that night on, whenever ${childName} went to sleep, the ${toy} would be ready. Ready for another adventure. Ready to bring back another beautiful dream. Because that's what best friends do they go on adventures together, even in dreams.\n\nAnd they all lived happily ever after, having wonderful adventures every single night.\n\nSweet dreams, dear ${childName}. Your ${toy} is watching over you, ready to take you on magical adventures whenever you close your eyes. Sleep tight, and remember: you are brave, you are loved, and you have friends on the Moon who think you're wonderful.\n\nThe end.\n\nGoodnight, ${childName}. 🌙✨`
    },
    {
      condition: () => toyLower.includes('bear') || toyLower.includes('teddy') || toyLower.includes('stuffed'),
      story: `In the coziest corner of ${childName}'s room, right next to the nightlight that glows like a tiny moon, sits ${toy}. To anyone else, ${toy} might look like just a regular cuddly friend. But ${childName} knows the truth ${toy} is magical, and has been since the very first day they met.\n\nYou see, ${toy} has a very important job, perhaps the most important job in the whole world. ${toy} is the Guardian of Dreams, specially chosen by the Dream Council (which meets every night in the Land of Clouds) to watch over ${childName} and make sure that only the sweetest, most wonderful dreams come to visit.\n\nEvery evening, as the sun says goodbye and the stars begin to wake up one by one, twinkling in the darkening sky, ${toy} begins to prepare for the night's work. When ${childName} climbs into bed and pulls up the cozy covers, ${toy} sits nearby, watching with caring button eyes. As ${childName}'s eyelids start to feel heavy and their breathing becomes soft and slow, something magical begins to happen.\n\n${toy} starts to glow with a gentle, warm light that only ${childName} can see (and maybe, if you believe hard enough, you can see it too). This special light is made of pure love and comfort, mixed with a sprinkle of starlight and a dash of moonbeam. ${toy} takes this magical light and very carefully, very gently, wraps it around ${childName} like an invisible blanket.\n\nThis blanket of light is special it keeps all the scary things away. No monsters, no worries, no sad thoughts can get through. It's like a shield made of hugs and warm cookies and everything safe and good in the world. With this blanket wrapped around them, ${childName} can sleep peacefully, knowing that ${toy} is standing guard.\n\nBut ${toy} doesn't just stand guard. Oh no! ${toy} takes ${childName} on the most wonderful dream adventures. You see, ${toy} has a secret door stitched right into its soft, cuddly tummy. This isn't a door that anyone can see when they're awake. But in dreams, when ${childName} hugs ${toy} very tight, the door opens with a gentle \"whoosh\" sound, like a soft wind through trees.\n\nThrough this door is a tunnel made entirely of rainbow clouds fluffy, colorful, and impossibly soft. ${childName} and ${toy} hold hands (or paws!) and walk through this rainbow tunnel. With each step, they feel lighter and happier, until they're floating, gently drifting along like leaves on a calm stream.\n\nAt the end of the rainbow tunnel is the most amazing place: the Forest of Gentle Dreams. This forest is unlike any forest in the waking world. Every single tree is made of the softest blankets and pillows imaginable. The trees have trunks of silky smooth fabric, and their leaves are made of the fluffiest cotton clouds. When the wind blows (and it's always a warm, gentle wind), the trees make a soft \"shhhhhhhh\" sound, like someone singing a quiet lullaby.\n\nThe forest floor isn't made of dirt or grass. Instead, it's covered in the most comfortable carpet you've ever felt soft as kitten fur, warm as sunshine, and in all the prettiest colors: pale pink, soft blue, gentle yellow, and mint green. Walking on it feels like walking on a dream itself.\n\nAs ${childName} and ${toy} walk through the Forest of Gentle Dreams, they meet all sorts of wonderful friends. There's Oliver the Owl, who isn't scary at all but rather is the wisest, kindest owl you could ever meet. Oliver wears tiny round glasses on his beak and loves to tell stories.\n\n\"Welcome, welcome!\" hoots Oliver softly whenever he sees them. \"Come, sit with me under the Story Tree!\" The Story Tree is the biggest tree in the forest, with branches that reach up so high they tickle the stars. Under this tree is a cozy reading nook made of the softest cushions.\n\nOliver tells ${childName} stories stories about brave little children who did kind things, about animals who helped each other, about magic that comes from being good and caring. But Oliver's stories aren't just entertaining. Each one has a special lesson hidden inside, like a treasure.\n\nOne night, Oliver told ${childName} about a little child (very much like ${childName}!) who was afraid of the dark. But then they discovered that the dark wasn't scary at all it was actually peaceful and calm, full of sleeping flowers and dreaming trees. The dark was just the world resting, getting ready for another bright day. After hearing that story, ${childName} felt less afraid of the dark.\n\nAnother time, Oliver told a story about sharing. He told about a young rabbit who had one carrot but met a hungry friend. When the rabbit shared the carrot, something magical happened - the carrot grew into two carrots, then four, then eight! The more you share, the more you have. ${childName} remembered this story the next day and shared their toys with a friend, and felt that same magical warm feeling.\n\nBut Oliver isn't the only friend in the Forest of Gentle Dreams. There's also Rosie the Rainbow Rabbit, whose fur changes colors depending on how she feels. When she's happy (which is most of the time), she's a beautiful swirl of all the rainbow colors. Rosie loves to play gentle games with ${childName} things like \"Find the Giggle\" (where you search for hidden giggles behind trees - and when you find them, you can't help but laugh!) or \"Cloud Catch\" (where you try to catch the softest little clouds that float down from the sky).\n\nThen there's Benny the Butterfly, whose wings are made of real stained glass that makes beautiful patterns when light shines through them. Benny is very quiet and gentle, and he teaches ${childName} how to be calm and peaceful. He shows ${childName} how to take deep, slow breaths just like flying slowly and smoothly through the air. \"When you feel worried,\" Benny whispers in his tiny voice, \"just breathe like you're a butterfly, and you'll feel better.\"\n\nThe friends love to take ${childName} to special places in the forest. One of their favorite spots is the Flower Garden of Feelings. In this garden, there are flowers for every feeling you could ever have. There are Joy Flowers that smell like birthday cake and summer sunshine. There are Calm Flowers that smell like fresh laundry and rain on grass. There are Brave Flowers that smell like adventure and new beginnings.\n\nBut there are also flowers for not-so-happy feelings. There are Sad Flowers (which smell like tears, but in a way that feels okay to cry), Angry Flowers (which smell like thunderstorms, but ones that pass quickly), and Scared Flowers (which smell like the dark, but being held close). The wonderful thing about the Flower Garden is that all the flowers are okay. All feelings are okay to have.\n\nOliver the Owl taught ${childName} something very important: \"Even when you feel sad or scared or angry, those feelings don't last forever. They come and they go, just like clouds in the sky. And no matter what you're feeling, you are still wonderful, still loved, and still special.\"\n\nSometimes, ${toy} and ${childName} visit the River of Giggles. This river doesn't flow with water instead, it flows with laughter! When you dip your hand in it, you can't help but giggle. When you splash in it, you laugh so hard your tummy hurts (but in a good way). The River of Giggles reminds ${childName} that laughter is magic, and that finding reasons to smile makes every day brighter.\n\nOther times, they visit the Meadow of Memories, where flowers bloom with happy memories. There are flowers that hold memories of birthday parties, of hugs from people they love, of favorite foods, of sunny days at the park. ${childName} can pick these flowers and hold them close, and the memories feel fresh and warm, like they just happened.\n\n${toy} makes sure that ${childName} visits the Lake of Peace at least once every night. This lake is so still and calm that it looks like a mirror. The water is warm and perfectly comfortable, and little glowing fish swim beneath the surface, making patterns of light. Just sitting by this lake makes all worries melt away. Sometimes ${childName} and ${toy} just sit there together, in comfortable silence, feeling peaceful and safe.\n\nAt the very heart of the Forest of Gentle Dreams stands the Tree of Love. This tree is enormous, bigger than any building, with golden bark that's warm to touch and leaves that shimmer with every color you can imagine. This tree is special it holds all the love in the world. Love from parents, from grandparents, from friends, from teachers, from pets everyone who has ever loved ${childName}.\n\nWhen ${toy} brings ${childName} to the Tree of Love, they place their hand on the golden bark. And when they do, ${childName} can feel all that love flowing into them, warm and strong and unbreakable. The tree whispers (yes, trees can whisper in the Forest of Gentle Dreams!), and it says:\n\n\"You are loved, ${childName}. You are so very loved. You are important. You matter. You make the world brighter just by being in it. You are kind, you are smart, you are creative, and you are enough exactly as you are.\"\n\nHearing these words fills ${childName} with a warm, glowing feeling that starts in their heart and spreads all the way to their fingers and toes. This feeling stays with them, even after they wake up, helping them feel confident and happy.\n\nAs the night goes on and the sky in the Forest starts to lighten with the first hints of dawn, ${toy} knows it's time to take ${childName} home. They say goodbye to all their friends. Oliver gives them a feather bookmark (so they'll never forget the stories). Rosie gives them a rainbow ribbon (to remember to find joy in every day). Benny gives them a tiny glass wing (to remember to stay calm and breathe).\n\nHand in hand, ${childName} and ${toy} walk back through the rainbow tunnel. With each step, they feel themselves getting sleepier and sleepier in the best way, like sinking into the most comfortable bed ever. The rainbow colors swirl around them, singing a soft lullaby that has no words but says everything: \"You are safe, you are loved, everything is okay.\"\n\nWhen they reach ${childName}'s room again, ${toy} very gently tucks the magic blanket of light a little tighter around ${childName}. ${toy} whispers in the softest voice you ever heard:\n\n\"Sleep now, my dear ${childName}. Sleep deeply and peacefully. I'll be right here, watching over you, keeping you safe. Dream beautiful dreams. And when morning comes, you'll wake up feeling rested, happy, and ready for another wonderful day. I love you very much, and I'm so proud to be your friend.\"\n\n${toy} places a soft paw on ${childName}'s chest, right over their heart, and sends one more wave of warm, loving light straight into ${childName}'s heart. This light will stay there all day tomorrow, making ${childName} feel brave when they try new things, kind when they play with friends, and confident when they learn new things.\n\nAnd so ${childName} drifts deeper into peaceful sleep, a gentle smile on their face. Throughout the rest of the night, ${toy} keeps watch, that soft glow never fading. Any time ${childName} shifts or makes a sound, ${toy} is there, ready to comfort, ready to protect, ready to love.\n\nWhen morning comes and sunshine peeks through the curtains, ${toy} will be right there in ${childName}'s arms, looking just like a regular cuddly toy again. But ${childName} will know the truth. They'll feel it in the warmth of ${toy}'s fur, see it in the kindness of ${toy}'s button eyes. They'll know that ${toy} is special, magical, and will always, always be there.\n\nAnd so, dear ${childName}, as you sleep tonight with your special ${toy}, remember this: You are loved beyond measure. You are braver than you know. You are kinder than you think. You are more important than you could ever imagine. And you have a magical friend who will guard your dreams forever.\n\nSweet dreams, precious ${childName}. The Forest of Gentle Dreams is waiting for you, and ${toy} will take you there safely.\n\nGoodnight, little one. Sleep tight. 🌟💖\n\nThe end.`
    }
  ];

  const matchingTemplate = templates.find(t => t.condition());
  
  if (matchingTemplate) {
    return matchingTemplate.story;
  }

  return `Once upon a time, in a world where magic was real and dreams came true, there lived a very special ${toy}. This ${toy} wasn't like other toys you see, because while other toys just sat on shelves waiting to be played with, this ${toy} had a magnificent secret. Every single night, when the stars came out to play and the moon smiled down from the sky, this ${toy} would come alive with the most wonderful magic you could ever imagine.\n\nThe ${toy} belonged to a very special ${ageDescription} named ${childName}. From the moment they first met, ${childName} and the ${toy} knew they were meant to be best friends. There was something about the way ${childName} held the ${toy}, something about the way they smiled at each other, that created a spark of pure magic.\n\nAs the sun would set each evening, painting the sky in beautiful colors of orange, pink, and purple, ${childName} would get ready for bed. After putting on cozy pajamas, brushing teeth until they sparkled, and getting tucked under warm, soft blankets, ${childName} would reach for the ${toy} and hold it close.\n\nAnd that's when the magic would begin.\n\nAs ${childName}'s eyes would flutter closed, growing heavy with sleepiness, the ${toy} would start to glow. At first, it was just a tiny shimmer, like a firefly's light. But then it would grow brighter and warmer, filling the whole room with a soft, gentle glow that felt like a hug made of light.\n\nThe ${toy} would whisper in the quietest, most loving voice, \"Are you ready, dear ${childName}? Are you ready for tonight's adventure?\" And even though ${childName} was drifting off to sleep, some part of them always heard and always answered yes.\n\nWith that yes, the room would transform. The walls would fade away like watercolors in rain, and suddenly ${childName} and the ${toy} would find themselves floating gently upward, lifted by invisible wings of starlight. They would float up, up, up, through the ceiling, through the roof, up into the vast and beautiful night sky.\n\nThe night sky at this magical hour wasn't dark and scary. Oh no! It was alive with wonder. Thousands upon thousands of stars twinkled like friendly eyes, each one winking hello to ${childName}. The moon, big and round and glowing silver-gold, smiled down at them like a proud grandparent.\n\n\"Where shall we go tonight?\" the ${toy} would ask. And the wind (which could talk in this magical place) would whisper suggestions. \"The Cloud Kingdom needs visitors!\" it would say. Or, \"The Rainbow Valley is having a celebration!\" Or, \"The Sea of Starlight is especially beautiful tonight!\"\n\nLet's say tonight they decided to visit the Cloud Kingdom. ${childName} and the ${toy} would fly together through the sky, holding hands (or paws!), swooping and soaring like birds. ${childName} would laugh with joy, feeling the cool night air on their face, seeing the world far below looking like a beautiful painting.\n\nSoon, they would arrive at the Cloud Kingdom, and oh, what a sight it was! Imagine entire castles made of clouds, fluffy and white and somehow solid enough to walk on. There were cloud bridges connecting cloud towers, cloud gardens full of cloud flowers that smelled like vanilla and cinnamon, and cloud fountains that sprayed sparkly mist into the air.\n\nThe ruler of the Cloud Kingdom was Queen Cumula, a tall, kind cloud woman with a crown made of rainbows. She would always be so happy to see ${childName}!\n\n\"Welcome, welcome, dear ${childName}!\" Queen Cumula would say, her voice soft and warm like a gentle breeze. \"We're so glad you've come to visit us! Come, let me show you something special.\"\n\nQueen Cumula would take ${childName} and the ${toy} to the Hall of Dreams, a magnificent room in the cloud castle. The walls of this hall were made of thousands of bubbles, and inside each bubble was a dream. Some bubbles showed happy dreams of playing with friends, some showed dreams of flying, some showed dreams of discovering treasure, some showed dreams of magical animals.\n\n\"These are dreams waiting to be given to sleeping children all over the world,\" Queen Cumula would explain. \"Would you like to help me send them out?\"\n\n${childName} would nod excitedly, and Queen Cumula would hand them a special wand made of moonbeam. \"Just point at a bubble and say 'Fly free and bring joy!' and the dream will travel to a child who needs it.\"\n\n${childName} would spend time carefully choosing which dreams to send to which children. They would send a dream about winning a race to a child who needed confidence. They would send a dream about finding a lost puppy to a child who loved animals. They would send a dream about making a new friend to a child who felt lonely. With each dream ${childName} sent off, they felt warm and happy inside, knowing they were helping other children have good dreams.\n\n\"You have such a kind heart, ${childName},\" Queen Cumula would say, placing a gentle hand on ${childName}'s shoulder. \"The world needs more people like you people who care about others and want to help.\"\n\nAfter helping with the dreams, Queen Cumula would invite ${childName} and the ${toy} to the Cloud Kingdom feast. The table would be set with the most delicious foods you could imagine (and some you couldn't!). There would be cloud cake that tasted like your favorite flavor, star cookies that sparkled on your tongue, moonbeam soup that was somehow both warm and cool at the same time, and rainbow juice that tasted like happiness.\n\nAs they ate, Queen Cumula would tell ${childName} stories. She would tell about the time a young cloud learned to make its first raindrop, about the brave wind who saved a lost kite, about the star who was afraid it wasn't bright enough but learned that every star shines perfectly in its own way.\n\nAfter the feast, the ${toy} would remind ${childName} that there was still more to see. Queen Cumula would hug them goodbye and say, \"Remember, ${childName}, whenever you see clouds during the day, know that we're up here thinking of you and sending you love.\"\n\n${childName} and the ${toy} would wave goodbye and fly off to their next destination: the Sea of Starlight. This wasn't water it was liquid light, glowing and shimmering in every color imaginable. The Sea of Starlight was calm and peaceful, and gentle waves of light would roll onto shores made of stardust.\n\nAt the Sea of Starlight, they would meet the Star Keeper, an ancient and wise being who looked like they were made entirely of constellations. The Star Keeper's job was to make sure every star in the sky was shining properly and that every wish made on a star was heard and remembered.\n\n\"Ah, ${childName},\" the Star Keeper would say in a voice that sounded like wind chimes, \"I've been expecting you. Come, walk with me along the shore.\"\n\nAs they walked along the glowing beach, the Star Keeper would talk to ${childName} about important things.\n\n\"${childName}, do you know why stars shine?\" the Star Keeper would ask.\n\n${childName} might not know, and that would be okay. The Star Keeper would smile and explain:\n\n\"Stars shine because that's what they were made to do. They don't shine because they have to, or because someone forces them to. They shine because shining is part of who they are. And you, dear ${childName}, you shine too. Your shine is your kindness, your curiosity, your laughter, your unique way of being you. Never let anyone dim your shine.\"\n\nThe Star Keeper would then show ${childName} something magical. They would point up at the sky, and one constellation would glow brighter than all the others.\n\n\"That constellation is yours, ${childName}. It appeared the night you were born, and it will shine in the sky forever. Whenever you feel lost or unsure, look up at the night sky and find your constellation. It will remind you of who you are and how special you are.\"\n\n${childName} would feel overwhelmed with emotion, feeling so seen and so special. The ${toy} would squeeze ${childName}'s hand, and ${childName} would know that they were never alone.\n\nThe Star Keeper would give ${childName} one more gift before they left. It would be a small vial filled with starlight. \"Keep this,\" the Star Keeper would say. \"Whenever you feel afraid, hold this vial and the starlight will remind you of your own inner light, which is stronger than any darkness.\"\n\nAs the night went on, ${childName} and the ${toy} would visit more magical places. They might stop by the Library of Forgotten Stories, where stories that were never written down were kept safe. They might visit the Garden of Growing, where plants grew bigger with every kind word spoken to them, teaching ${childName} that words have power. They might meet the Dream Weaver, a kind spider who wove dreams out of silver thread.\n\nAt each place, ${childName} would learn something valuable. They would learn about kindness, courage, creativity, and love. They would learn that mistakes are okay because that's how we learn. They would learn that being different is wonderful. They would learn that asking for help is brave, not weak. They would learn that their feelings matter and that it's okay to feel whatever they feel.\n\nBut eventually, as the sky began to lighten with the first hints of dawn, the ${toy} would say gently, \"It's almost time to wake up, dear ${childName}. We should head home now.\"\n\n${childName} would feel a little sad that the adventure was ending, but also excited to wake up and start a new day. The ${toy} would take ${childName}'s hand, and together they would fly back home, floating gently down through the lightening sky.\n\nAs they descended, all the magical friends they'd made that night would call out goodbye. \"Goodbye, ${childName}!\" \"Come back soon!\" \"We love you!\" \"You're wonderful!\" \"Sweet dreams!\"\n\n${childName} and the ${toy} would float back through the roof, through the ceiling, and land softly back in ${childName}'s cozy bed. The magical glow would fade from the ${toy}, and everything would look normal again. But ${childName} would still feel the magic inside their heart.\n\nThe ${toy} would snuggle close to ${childName} and whisper one last thing before the dream ended:\n\n\"Remember everything you learned tonight, ${childName}. Remember that you are special and loved. Remember that you have your own unique shine. Remember that you can do hard things. Remember that asking for help is okay. Remember that mistakes help you grow. Remember that you are braver than you think, stronger than you seem, and smarter than you believe. And remember that no matter what happens, I will always be here with you, ready to take you on more magical adventures every single night.\"\n\nAnd with that, ${childName} would drift into the deepest, most peaceful sleep, a gentle smile on their face. Throughout the morning, even as they started to wake up, they would feel different. They would feel loved, confident, peaceful, and ready to face the day.\n\nWhen ${childName} finally opened their eyes to the morning sun, the ${toy} would be right there, looking just like a regular toy again. But ${childName} would know the truth. They would pick up the ${toy}, give it a big hug, and whisper, \"Thank you for the adventure. I can't wait for tonight.\"\n\nAnd the ${toy}, though it couldn't move or talk in the daytime, would be smiling inside, already planning the next magical adventure.\n\nBecause that's what best friends do. They go on adventures together. They protect each other. They teach each other. They love each other. And most importantly, they're always there for each other, in dreams and in waking life.\n\nSo tonight, dear ${childName}, when you close your eyes and hold your ${toy} close, remember this story. Remember that magic is real, that you are special, and that amazing adventures are waiting for you in the land of dreams.\n\nSweet dreams, wonderful ${childName}. May your sleep be peaceful, your dreams be magical, and your tomorrow be filled with joy.\n\nThe ${toy} is waiting. The adventures are ready. All you have to do is close your eyes and believe.\n\nGoodnight. Sleep tight. Dream bright. ✨🌙💫\n\nThe end.`;
}
