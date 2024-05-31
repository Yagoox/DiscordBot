import { Responder, ResponderType } from "#base";
import { createRow } from "@magicyan/discord";
import { StringSelectMenuBuilder, StringSelectMenuInteraction, PermissionsBitField } from "discord.js";

new Responder({
    customId: "manage/user/:userId/:action",
    type: ResponderType.Row,
    cache: "cached",
    async run(interaction, { userId, action }) {
        const { guild } = interaction;

        const mention = guild.members.cache.get(userId);

        if (!mention) {
            await interaction.reply({ ephemeral: true, content: 'User not found.' });
            return;
        }

        switch (action) {
            case "alert":
                try {
                    await interaction.reply({ ephemeral: true, content: `${mention} has been alerted.` });
                    await mention.send("You have been alerted. Please review your behavior to avoid further issues.");
                } catch (error) {
                    await interaction.reply({ ephemeral: true, content: `Failed to send alert to ${mention}.` });
                }
                return;
            case "ban":
                await interaction.reply({ ephemeral: true, content: `${mention} has been banned.` });
                return;
            case "kickout":
                await interaction.reply({ ephemeral: true, content: `${mention} has been kicked.` });
                return;
            case "punishment":
                await interaction.reply({ ephemeral: true, content: `${mention} has been punished.` });
                return;
            case "mute": {
                const row = createRow(
                    new StringSelectMenuBuilder({
                        customId: `manage/user/${mention.id}/time`,
                        placeholder: "Select Time",
                        options: [
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
                        ]
                    })
                );
                await interaction.update({ components: [row] });
                return;
            }
            case "time": {
                const selected = (interaction as StringSelectMenuInteraction).values[0];
                const duration = parseInt(selected, 10) * 1000;

                if (!mention) {
                    await interaction.update({
                        content: "This member is no longer part of the server.",
                        components: [],
                    });
                    return;
                }

                if (interaction.member.id === mention.id) {
                    await interaction.update({
                        content: "You cannot apply a timeout to yourself.",
                        components: [],
                    });
                    return;
                }

                const selfMember = interaction.guild.members.me;
                if (!selfMember || !selfMember.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
                    await interaction.update({
                        content: "I do not have permission to apply timeouts to members.",
                        components: [],
                    });
                    return;
                }

                try {
                    await mention.timeout(duration, "Timeout applied via management command.");
                    await interaction.update({ content: `${mention} has been muted for ${selected} seconds.`, components: [] });
                } catch (error) {
                    await interaction.update({ content: `Failed to mute ${mention}.`, components: [] });
                }
                return;
            }
            case "unmute":
                try {
                    await mention.timeout(null, "Unmute applied via management command.");
                    await interaction.reply({ ephemeral: true, content: `${mention} has been unmuted.` });
                } catch (error) {
                    await interaction.reply({ ephemeral: true, content: `Failed to unmute ${mention}.` });
                }
                return;
            default:
                await interaction.reply({ ephemeral: true, content: 'Action not recognized.' });
                return;
        }
    },
});
