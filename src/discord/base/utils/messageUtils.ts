import {
    ChatInputCommandInteraction,
    MessageComponentInteraction,
    UserContextMenuCommandInteraction,
    CacheType,
} from "discord.js";

export const deleteAfterTimeout = async (
    interaction: ChatInputCommandInteraction<CacheType> | MessageComponentInteraction<CacheType> | UserContextMenuCommandInteraction<CacheType>,
    timeout: number = 9000
) => {
    setTimeout(async () => {
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.deleteReply();
            }
        } catch (error) {
            console.error('Failed to delete reply:', error);
        }
    }, timeout);
};
