import { Responder, ResponderType, deleteAfterTimeout } from "#base";
import { createRow } from "@magicyan/discord";
import {
    CacheType,
    ChatInputCommandInteraction,
    MessageComponentInteraction,
    PermissionsBitField,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
} from "discord.js";

new Responder({
    customId: "manage/user/:userId/:action",
    type: ResponderType.Row,
    cache: "cached",
    async run(interaction: ChatInputCommandInteraction<CacheType> | MessageComponentInteraction<CacheType>, { userId, action }) {
        const { guild } = interaction;

        const mention = guild?.members.cache.get(userId);

        if (!mention) {
            await interaction.reply({ ephemeral: true, content: 'User not found.' });
            deleteAfterTimeout(interaction);
            return;
        }

        switch (action) {
            case "alert":
                try {
                    await interaction.reply({ ephemeral: true, content: `${mention} has been alerted.` });
                    await mention.send("You have been alerted. Please review your behavior to avoid further issues.");
                    deleteAfterTimeout(interaction);
                } catch (error) {
                    await interaction.reply({ ephemeral: true, content: `Failed to send alert to ${mention}.` });
                    deleteAfterTimeout(interaction);
                }
                return;
            case "ban":
                try {
                    await mention.ban({ reason: 'Banned via manage user command.' });
                    await interaction.reply({ ephemeral: true, content: `${mention} has been banned.` });
                    deleteAfterTimeout(interaction);
                } catch (error) {
                    await interaction.reply({ ephemeral: true, content: `Failed to ban ${mention}.` });
                    deleteAfterTimeout(interaction);
                }
                return;
            case "kickout":
                try {
                    await mention.kick('Kicked via manage user command.');
                    await interaction.reply({ ephemeral: true, content: `${mention} has been kicked.` });
                    deleteAfterTimeout(interaction);
                } catch (error) {
                    await interaction.reply({ ephemeral: true, content: `Failed to kick ${mention}.` });
                    deleteAfterTimeout(interaction);
                }
                return;
            case "punishment":
                await interaction.reply({ ephemeral: true, content: `${mention} has been punished.` });
                deleteAfterTimeout(interaction);
                return;
            case "mute": {
                const row = createRow(
                    new StringSelectMenuBuilder()
                        .setCustomId(`manage/user/${mention.id}/time`)
                        .setPlaceholder("Select Time")
                        .addOptions([
                            { label: "60 Seconds", value: "60" },
                            { label: "2 Minutes", value: "120" },
                            { label: "5 Minutes", value: "300" },
                            { label: "10 Minutes", value: "600" },
                            { label: "20 Minutes", value: "1200" },
                            { label: "30 Minutes", value: "1800" },
                            { label: "45 Minutes", value: "2700" },
                            { label: "1 Hour", value: "3600" },
                            { label: "2 Hours", value: "7200" },
                            { label: "3 Hours", value: "10800" },
                            { label: "5 Hours", value: "18000" },
                            { label: "10 Hours", value: "36000" },
                            { label: "1 Day", value: "86400" },
                            { label: "2 Days", value: "172800" },
                            { label: "3 Days", value: "259200" },
                            { label: "5 Days", value: "432000" },
                            { label: "1 Week", value: "604800" }
                        ])
                );
                await interaction.reply({ ephemeral: true, content: `${mention} has been muted. Please select the mute duration:`, components: [row] });
                deleteAfterTimeout(interaction);
                return;
            }
            case "time": {
                const selected = (interaction as StringSelectMenuInteraction).values[0];
                const duration = parseInt(selected, 10) * 1000;

                if (!mention) {
                    if (interaction.isMessageComponent()) {
                        await interaction.update({
                            content: "This member is no longer part of the server.",
                            components: [],
                        });
                    } else {
                        await interaction.editReply({
                            content: "This member is no longer part of the server.",
                        });
                    }
                    deleteAfterTimeout(interaction);
                    return;
                }

                if ((interaction.member as any).id === mention.id) {
                    if (interaction.isMessageComponent()) {
                        await interaction.update({
                            content: "You cannot apply a timeout to yourself.",
                            components: [],
                        });
                    } else {
                        await interaction.editReply({
                            content: "You cannot apply a timeout to yourself.",
                        });
                    }
                    deleteAfterTimeout(interaction);
                    return;
                }

                const selfMember = interaction.guild!.members.me;
                if (!selfMember || !selfMember.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
                    if (interaction.isMessageComponent()) {
                        await interaction.update({
                            content: "I do not have permission to apply timeouts to members.",
                            components: [],
                        });
                    } else {
                        await interaction.editReply({
                            content: "I do not have permission to apply timeouts to members.",
                        });
                    }
                    deleteAfterTimeout(interaction);
                    return;
                }

                try {
                    await mention.timeout(duration, "Timeout applied via management command.");
                    if (interaction.isMessageComponent()) {
                        await interaction.update({
                            content: `${mention} has been muted for ${selected} seconds.`,
                            components: [],
                        });
                    } else {
                        await interaction.editReply({
                            content: `${mention} has been muted for ${selected} seconds.`,
                        });
                    }
                    deleteAfterTimeout(interaction);
                } catch (error) {
                    if (interaction.isMessageComponent()) {
                        await interaction.update({
                            content: `Failed to mute ${mention}.`,
                            components: [],
                        });
                    } else {
                        await interaction.editReply({
                            content: `Failed to mute ${mention}.`,
                        });
                    }
                    deleteAfterTimeout(interaction);
                }
                return;
            }
            case "unmute":
                try {
                    await mention.timeout(null, "Unmute applied via management command.");
                    await interaction.reply({ ephemeral: true, content: `${mention} has been unmuted.` });
                    deleteAfterTimeout(interaction);
                } catch (error) {
                    await interaction.reply({ ephemeral: true, content: `Failed to unmute ${mention}.` });
                    deleteAfterTimeout(interaction);
                }
                return;
            default:
                await interaction.reply({ ephemeral: true, content: 'Action not recognized.' });
                deleteAfterTimeout(interaction);
                return;
        }
    },
});
