
const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');


const emojiPatterns = [
  /<a:([^:]+):(\d+)>/g,                     // Animated emoji format: <a:name:id>
  /<:([^:]+):(\d+)>/g,                      // Static emoji format: <:name:id>
  /setEmoji\(['"]<a:([^:]+):(\d+)>['"]\)/g,  // setEmoji with animated emoji
  /setEmoji\(['"]<:([^:]+):(\d+)>['"]\)/g,   // setEmoji with static emoji
  /emoji: ['"]<a:([^:]+):(\d+)>['"]/g,       // emoji property with animated emoji
  /emoji: ['"]<:([^:]+):(\d+)>['"]/g,        // emoji property with static emoji
];


const excludeDirs = ['.git', 'node_modules', 'data', '.local', '.cache', '.config'];


const GUILD_ID_1 = '1428438656116457627'; 
const GUILD_ID_2 = '1428452169945976986'; 


async function scanDirectory(dir) {
  const emojis = new Map();
  
  async function scan(currentDir) {
    const files = await readdir(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stats = await stat(filePath);
      
      
      if (stats.isDirectory()) {
        if (!excludeDirs.includes(file)) {
          await scan(filePath);
        }
        continue;
      }
      
      
      if (!['.js', '.json'].includes(path.extname(file))) continue;
      
      try {
        const content = await readFile(filePath, 'utf8');
        
        
        for (const pattern of emojiPatterns) {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const emojiName = match[1];
            const emojiId = match[2];
            
            
            const isAnimated = pattern.toString().includes('<a:');
            const extension = isAnimated ? 'gif' : 'png';
            const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${extension}`;
            
            emojis.set(emojiId, {
              name: emojiName,
              id: emojiId,
              url: emojiUrl,
              format: isAnimated ? `<a:${emojiName}:${emojiId}>` : `<:${emojiName}:${emojiId}>`,
              file: filePath,
              isAnimated: isAnimated
            });
          }
        }
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
      }
    }
  }
  
  await scan(dir);
  return Array.from(emojis.values());
}


function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(filePath, () => {}); 
        
        
        if (response.statusCode === 415 && url.endsWith('.gif')) {
          const pngUrl = url.replace('.gif', '.png');
          const pngFilePath = filePath.replace('.gif', '.png');
          
          console.log(`GIF format failed, trying PNG: ${pngUrl}`);
          
          https.get(pngUrl, (pngResponse) => {
            if (pngResponse.statusCode !== 200) {
              reject(new Error(`Failed to fetch as PNG too: ${pngResponse.statusCode} ${pngResponse.statusMessage}`));
              return;
            }
            
            const pngFile = fs.createWriteStream(pngFilePath);
            pngResponse.pipe(pngFile);
            
            pngFile.on('finish', () => {
              pngFile.close();
              resolve(pngFilePath);
            });
          }).on('error', (err) => {
            fs.unlink(pngFilePath, () => {});
            reject(err);
          });
          
          return;
        }
        
        reject(new Error(`Failed to fetch: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(filePath);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); 
      reject(err);
    });
  });
}


async function uploadEmojisToGuilds(client, emojis) {
  const emojiMapping = new Map(); 
  
  
  const emojisForGuild1 = emojis.slice(0, 50);
  const emojisForGuild2 = emojis.slice(50);
  
  console.log(`\nSplitting ${emojis.length} emojis:`);
  console.log(`- First 50 emojis → Server 1 (${GUILD_ID_1})`);
  console.log(`- Remaining ${emojisForGuild2.length} emojis → Server 2 (${GUILD_ID_2})\n`);
  
  
  if (emojisForGuild1.length > 0) {
    const guild1 = await client.guilds.fetch(GUILD_ID_1);
    console.log(`\n📤 Uploading ${emojisForGuild1.length} emojis to ${guild1.name}...`);
    
    for (const emoji of emojisForGuild1) {
      const mapping = await uploadSingleEmoji(guild1, emoji);
      if (mapping) {
        emojiMapping.set(emoji.id, mapping);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  
  if (emojisForGuild2.length > 0) {
    const guild2 = await client.guilds.fetch(GUILD_ID_2);
    console.log(`\n📤 Uploading ${emojisForGuild2.length} emojis to ${guild2.name}...`);
    
    for (const emoji of emojisForGuild2) {
      const mapping = await uploadSingleEmoji(guild2, emoji);
      if (mapping) {
        emojiMapping.set(emoji.id, mapping);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return emojiMapping;
}


async function uploadSingleEmoji(guild, emoji) {
  try {
    
    const existingEmoji = guild.emojis.cache.find(e => e.name === emoji.name);
    if (existingEmoji) {
      console.log(`♻️  Emoji already exists: ${emoji.name} (Old ID: ${emoji.id}, Existing ID: ${existingEmoji.id})`);
      return {
        oldId: emoji.id,
        newId: existingEmoji.id,
        name: emoji.name,
        isAnimated: existingEmoji.animated
      };
    }
    
    const emojiUrl = emoji.url;
    
    
    let createdEmoji;
    try {
      createdEmoji = await guild.emojis.create({
        attachment: emojiUrl,
        name: emoji.name
      });
      console.log(`✅ Uploaded emoji: ${emoji.name} (Old ID: ${emoji.id}, New ID: ${createdEmoji.id})`);
      return {
        oldId: emoji.id,
        newId: createdEmoji.id,
        name: emoji.name,
        isAnimated: emoji.isAnimated
      };
    } catch (uploadError) {
      
      if (uploadError.code === 50035 || uploadError.code === 30008) {
        console.log(`⚠️ Failed to upload ${emoji.name} directly, trying alternative URL...`);
        
        
        if (emoji.isAnimated) {
          const pngUrl = emojiUrl.replace('.gif', '.png');
          try {
            createdEmoji = await guild.emojis.create({
              attachment: pngUrl,
              name: emoji.name
            });
            console.log(`✅ Uploaded emoji as PNG: ${emoji.name} (Old ID: ${emoji.id}, New ID: ${createdEmoji.id})`);
            return {
              oldId: emoji.id,
              newId: createdEmoji.id,
              name: emoji.name,
              isAnimated: false
            };
          } catch (pngError) {
            console.error(`❌ Failed to upload ${emoji.name}:`, pngError.message);
          }
        } else {
          console.error(`❌ Failed to upload ${emoji.name}:`, uploadError.message);
        }
      } else {
        console.error(`❌ Failed to upload ${emoji.name}:`, uploadError.message);
      }
    }
  } catch (error) {
    console.error(`❌ Error uploading emoji ${emoji.name}:`, error.message);
  }
  return null;
}


async function replaceEmojiIds(rootDir, emojiMapping) {
  console.log('\nReplacing emoji IDs in files...');
  
  async function replaceInFiles(currentDir) {
    const files = await readdir(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stats = await stat(filePath);
      
      if (stats.isDirectory()) {
        if (!excludeDirs.includes(file)) {
          await replaceInFiles(filePath);
        }
        continue;
      }
      
      if (!['.js', '.json'].includes(path.extname(file))) continue;
      
      try {
        let content = await readFile(filePath, 'utf8');
        let modified = false;
        
        
        for (const [oldId, mapping] of emojiMapping.entries()) {
          const oldAnimated = `<a:${mapping.name}:${oldId}>`;
          const oldStatic = `<:${mapping.name}:${oldId}>`;
          const newEmoji = mapping.isAnimated ? `<a:${mapping.name}:${mapping.newId}>` : `<:${mapping.name}:${mapping.newId}>`;
          
          if (content.includes(oldAnimated)) {
            content = content.replaceAll(oldAnimated, newEmoji);
            modified = true;
          }
          
          if (content.includes(oldStatic)) {
            content = content.replaceAll(oldStatic, newEmoji);
            modified = true;
          }
          
          
          const idRegex = new RegExp(`(["'\`])${oldId}\\1`, 'g');
          if (idRegex.test(content)) {
            content = content.replace(idRegex, `$1${mapping.newId}$1`);
            modified = true;
          }
        }
        
        if (modified) {
          await writeFile(filePath, content, 'utf8');
          console.log(`✅ Updated: ${path.relative(rootDir, filePath)}`);
        }
        
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error.message);
      }
    }
  }
  
  await replaceInFiles(rootDir);
}


async function main() {
  const rootDir = __dirname; 
  
  
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildEmojisAndStickers]
  });
  
  await client.login(config.token);
  
  client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`Scanning directory: ${rootDir}`);
    
    const emojis = await scanDirectory(rootDir);
    
    
    console.log('\nFound Emojis:');
    console.log('=============');
    
    emojis.forEach(emoji => {
      console.log(`- ${emoji.name} (${emoji.id}): ${emoji.url}`);
      console.log(`  Format: ${emoji.format}`);
      console.log(`  Type: ${emoji.isAnimated ? 'Animated (GIF)' : 'Static (PNG)'}`);
      console.log(`  Found in: ${path.relative(rootDir, emoji.file)}`);
      console.log('');
    });
    
    
    const outputPath = path.join(__dirname, 'emojis.json');
    fs.writeFileSync(outputPath, JSON.stringify(emojis, null, 2));
    console.log(`Emoji list saved to ${outputPath}`);
    
    
    const emojiMapping = await uploadEmojisToGuilds(client, emojis);
    
    
    const mappingPath = path.join(__dirname, 'emoji-mapping.json');
    const mappingArray = Array.from(emojiMapping.values());
    fs.writeFileSync(mappingPath, JSON.stringify(mappingArray, null, 2));
    console.log(`\nEmoji mapping saved to ${mappingPath}`);
    
    
    await replaceEmojiIds(rootDir, emojiMapping);
    
    console.log('\n✅ All done! Emoji IDs have been replaced.');
    
    await client.destroy();
    process.exit(0);
  });
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
