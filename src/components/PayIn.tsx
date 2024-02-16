import { Checkbox, Label, Table } from "flowbite-react";
import { RevealText } from "./RevealText";
import { AnimatePresence } from "framer-motion";
import {
  FleetMemberTable,
  groupCharacterIds,
  groupFleetByMains,
} from "../utils/fleet";
import { useContext, useEffect, useMemo, useState } from "react";
import { m } from "framer-motion";
import { NumberInput } from "../utils/form";
import { AuthContext } from "../contexts/AuthContext";
import { CharacterWalletJournalEntries, getWalletJournal } from "../utils/api";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ShareSettings } from "./ShareEditor";
import { taxToPercentage } from "../utils/shares";

export const FLASHPOINT_15_PER_PERSON = 236000000;

export interface PayInContext {
  expectedSitePayout: number;
}

interface PayInProps {
  fleetMembers: FleetMemberTable;
  context: PayInContext;
  settings: ShareSettings;
  setContext: (context: PayInContext) => void;
}

interface EnabledJournalEntry {
  characterId: number;
  enabled: boolean;
  value: number;
}

interface JournalEntryTable {
  [key: string]: EnabledJournalEntry;
}

export function PayIn({
  fleetMembers,
  context,
  settings,
  setContext,
}: PayInProps) {
  const { identity, token } = useContext(AuthContext);
  const [transactionDataLoading, setTransactionDataLoading] = useState(false);
  const [relevantTransactions, setRelevantTransactions] =
    useState<CharacterWalletJournalEntries>([]);
  const [enabledTransactions, setEnabledTransactions] =
    useState<JournalEntryTable>({});

  useEffect(() => {
    const run = async () => {
      if (token && identity?.id && !transactionDataLoading) {
        setTransactionDataLoading(true);
        const { data, error } = await getWalletJournal(token, identity?.id);
        setTransactionDataLoading(false);
        if (error) {
          console.error(error);
          return;
        }

        const transactions = (data as CharacterWalletJournalEntries)
          .filter(
            (entry) =>
              (entry.ref_type === "player_donation" ||
                entry.ref_type === "corporation_account_withdrawal") &&
              (entry.amount ?? 0) > 0,
          )
          .filter(
            (entry) =>
              entry.first_party_id &&
              fleetMembers[entry.first_party_id] !== undefined,
          );

        setRelevantTransactions(transactions);
      }
    };

    const interval = setInterval(() => run(), 5_000);

    return () => {
      clearInterval(interval);
    };
  }, [setTransactionDataLoading, transactionDataLoading]);

  const membersInPayout = useMemo(
    () =>
      Object.values(fleetMembers).filter((member) => member.partOfSitePayout),
    [fleetMembers],
  );

  const payOutPerCharacter = useMemo(() => {
    if (membersInPayout.length > 0) {
      const percent =
        1 -
        taxToPercentage(
          settings.corpTaxType,
          settings.corpTaxValue,
          context.expectedSitePayout,
        );

      return `${new Intl.NumberFormat().format(
        (context.expectedSitePayout / membersInPayout.length) * percent,
      )}`;
    } else {
      return "???";
    }
  }, [membersInPayout, context, settings]);

  const membersPaidList = useMemo(() => {
    // Get alt groups
    const altGroups = groupFleetByMains(membersInPayout);

    // Keep list small by only showing mains
    const mains = Object.values(altGroups).map((member) => member.member);

    const enabledTransactionsList = Object.values(enabledTransactions);

    return mains.map((member) => {
      const moneyReceived = enabledTransactionsList
        // Get all enabled transactions that are relevant to the alt or main
        .filter(
          (entry) =>
            groupCharacterIds(altGroups[member.characterId]).includes(
              entry.characterId,
            ) && entry.enabled,
        )
        // Add them together
        .reduce((acc, data) => acc + data.value, 0);

      return (
        <m.tr
          className="bg-white dark:border-gray-700 dark:bg-gray-800"
          key={member.characterId}
          layout={true}
          transition={{ type: "spring" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Table.Cell>
            {moneyReceived >=
            context.expectedSitePayout / membersInPayout.length
              ? "✅"
              : null}
          </Table.Cell>
          <Table.Cell>{member.name}</Table.Cell>
          <Table.Cell>
            {altGroups[member.characterId].alts.length + 1}
          </Table.Cell>
          <Table.Cell>
            Ƶ {new Intl.NumberFormat().format(moneyReceived)}
          </Table.Cell>
        </m.tr>
      );
    });
  }, [membersInPayout, enabledTransactions, context]);

  const transactionList = useMemo(() => {
    return relevantTransactions.map((entry) => (
      <m.tr
        className="bg-white dark:border-gray-700 dark:bg-gray-800"
        key={entry.id}
        layout={true}
        transition={{ type: "spring" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Table.Cell>
          <Checkbox
            checked={enabledTransactions[entry.id]?.enabled ?? false}
            onChange={() => {
              const newTransactionTable = { ...enabledTransactions };
              if (!newTransactionTable[entry.id]) {
                newTransactionTable[entry.id] = {
                  characterId: entry.first_party_id!,
                  enabled: true,
                  value: entry.amount ?? 0,
                };
              } else {
                newTransactionTable[entry.id].enabled =
                  !newTransactionTable[entry.id].enabled;
              }

              setEnabledTransactions(newTransactionTable);
            }}
          />
        </Table.Cell>
        <Table.Cell>{formatDistanceToNow(parseISO(entry.date))} ago</Table.Cell>
        <Table.Cell>
          {entry.first_party_id
            ? fleetMembers[entry.first_party_id].name ?? "Unknown Capsuleer"
            : "N/a"}
        </Table.Cell>
        <Table.Cell>
          Ƶ {entry.amount ? new Intl.NumberFormat().format(entry.amount) : 0}
        </Table.Cell>
      </m.tr>
    ));
  }, [
    relevantTransactions,
    fleetMembers,
    enabledTransactions,
    setEnabledTransactions,
  ]);

  return (
    <div className="w-full lg:w-3/4 mt-2 flex flex-col gap-2 items-center">
      <RevealText text="Pay In" className="text-3xl mb-1" />
      <div className="w-full flex flex-row gap-10 my-6">
        <div className="flex flex-col gap-6">
          <NumberInput
            id="pay-in"
            addon="Ƶ"
            label="Expected Site Payout"
            value={context.expectedSitePayout}
            setValue={(expectedSitePayout) =>
              setContext({ ...context, expectedSitePayout })
            }
          />
          <NumberInput
            id="pay-per-person"
            label="Expected Site Payout per Character"
            value={payOutPerCharacter}
          />
          <Label value={"Wallet Transactions"} className="text-xl mono-one" />
          <Table striped className="w-full dark:bg-slate-800 rounded">
            <Table.Head>
              <Table.HeadCell></Table.HeadCell>
              <Table.HeadCell>When</Table.HeadCell>
              <Table.HeadCell>From</Table.HeadCell>
              <Table.HeadCell>Ƶ Received</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              <AnimatePresence>{transactionList}</AnimatePresence>
            </Table.Body>
          </Table>
        </div>
        <div className="grow">
          <Table striped className="w-full dark:bg-slate-800 rounded">
            <Table.Head>
              <Table.HeadCell></Table.HeadCell>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Characters in Payout</Table.HeadCell>
              <Table.HeadCell>Ƶ Received from Player</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              <AnimatePresence>{membersPaidList}</AnimatePresence>
            </Table.Body>
          </Table>
          {membersPaidList.length === 0 ? (
            <p className="text-gray-400 text-center py-6">
              Fleet Members will appear here once marked as "In this Payout".
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
