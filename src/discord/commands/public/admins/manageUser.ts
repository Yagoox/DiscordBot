import { Command, deleteAfterTimeout } from "#base";
import { createRow } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, PermissionsBitField, EmbedBuilder } from "discord.js";

new Command({
    name: "ToManage",
    type: ApplicationCommandType.User,
    async run(interaction) {
        const member = interaction.guild?.members.cache.get(interaction.user.id);

        if (!member || !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({ ephemeral: true, content: "You do not have permission to use this command." });
            return;
        }

        const { targetId } = interaction;

        const embed = new EmbedBuilder()
            .setColor('#d3c4a3')  
            .setTitle("User Management Panel")
            .setDescription(`Manage actions for user <@${targetId}>.`)
            .addFields(
                { name: "Alert", value: "Alert the user to review their behavior.", inline: true },
                { name: "Ban", value: "Ban the user from the server.", inline: true },
                { name: "KickOut", value: "Kick the user from the server.", inline: true },
                { name: "Punishment", value: "Apply a punishment to the user.", inline: true },
                { name: "Mute", value: "Mute the user for a period.", inline: true },
                { name: "UnMute", value: "Unmute the user.", inline: true }
            )
            .setFooter({ text: "Use the buttons below to perform actions." });

        const row = createRow(
            new ButtonBuilder()
                .setCustomId(`manage/user/${targetId}/alert`)
                .setLabel("Alert")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`manage/user/${targetId}/ban`)
                .setLabel("Ban")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`manage/user/${targetId}/kickout`)
                .setLabel("KickOut")
                .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                .setCustomId(`manage/user/${targetId}/mute`)
                .setLabel("Mute")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`manage/user/${targetId}/unmute`)
                .setLabel("UnMute")
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({ ephemeral: true, embeds: [embed], components: [row] });
        deleteAfterTimeout(interaction);
    }
});
