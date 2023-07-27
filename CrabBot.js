const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Crab Bot is ready as: ${client.user.tag}`);
});

client.on('message', async message => {
  if (message.content.startsWith('$search')) {
    // Extract the search term from the message
    const searchTerm = message.content.split(' ').slice(1).join(' ');

    // Get all text channels in the server
    const textChannels = message.guild.channels.cache.filter(channel => channel.type === 'text');

    let foundMessages = [];

    // Loop through each text channel
    for (const channel of textChannels.values()) {
      if (foundMessages.length >= 3) break; // Stop if we have found 3 messages

      let lastID;

      // While loop to fetch more than 100 messages
      while (true) {
        if (foundMessages.length >= 3) break; // Stop if we have found 3 messages

        // Fetch some messages from the channel
        const options = { limit: 100 };
        if (lastID) {
          options.before = lastID;
        }
        const messages = await channel.messages.fetch(options);

        // If no more messages, stop the while loop
        if (messages.size === 0) {
          break;
        }

        // Loop through each fetched message
        for (const fetchedMessage of messages.values()) {
          if (foundMessages.length >= 3) break; // Stop if we have found 3 messages

          // Check if the message content includes the search term and has attachments or embeds (links)
          if (fetchedMessage.content.includes(searchTerm) && (fetchedMessage.attachments.size > 0 || fetchedMessage.embeds.length > 0)) {
            // Check if the message includes links from specific domains
            const domains = ['drive.google.com', 'mega.nz', 'mediafire.com'];
            const includesLinkFromSpecificDomains = domains.some(domain => fetchedMessage.content.includes(domain));

            if (includesLinkFromSpecificDomains) {
              // Add the message link to the found messages
              foundMessages.push(`https://discord.com/channels/${message.guild.id}/${channel.id}/${fetchedMessage.id}`);
            }
          }
        }

        // Get the ID of the last message fetched
        lastID = messages.last().id;
      }
    }

    // Reply to the user with the found messages
    message.reply(foundMessages.join('\n') || 'No messages found');
  }
});

client.login(${{ secrets.BOT_TOKEN }});
